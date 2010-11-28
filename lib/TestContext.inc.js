/**
 * Test Context: Where the scripts are or where they files they are accessing are.
 * This base class is meant to be extended to provide the specifics, with the methods defined here
 * being the public API for all classes. They may, of course, be overridden where necessary 
 * in sub-classes
 */
var TestContext = Class.create( TestBenchFactor, {
	/**
	 * Returns the physical path to the files directory
	 *
	 * @returns {String} filesDir
	 */
	'getDir':		function( key ) {
							if( Object.isUndefined( this._dirs ) ){
								this._dirs = {};
							}
							if( !this._dirs[key] ){
								this._dirs[key] = $$.fso.BuildPath(
									this.rootPath,
									$$.fso.GetTempName()
								);
							}
							return this._dirs[key];
						},
	
	
	/**
	 * Sets up the files directory with a number of resources so the script can test against them
	 * Currently calls global function of same name.
	 * TODO: Bring global function in to the TestContext object
	 *
	 * @returns {void}
	 * @throws {Error} if blocking problem occurs
	 */
	'setup':			function( key ) {
							return mkdir( this.getDir( key ) );
						},
	
	/**
	 * Empties the files directory.
	 * Deletes and resets the stored this.filesdir
	 *
	 * @returns {void}
	 * @throws {Error} if blocking problem occurs
	 */
	'destroy':		function( key ) {
							$$.withRetry( 'CMD /C "RD /S /Q "{0}""', this.getDir( key ) );
							delete this.filesDir;
							return true;
						},
						
	/**
	 * Called when created with 'new' keyword. Set up the object.
	 * @param {String} name
	 * @param {String} rootPath
	 * 
	 * @return {TestContext} this is part of the constructor, so it returns the constructed object
	 */
	'initialize':		function(
							name,
							rootPath 
						) {
							this.name = name;
							this.rootPath = rootPath;
							return this;
						},
	
	/**
	 * Return a simple string describing this factor.
	 * 
	 * @return {String};
	 */
	'describe':			function() {
							return this.name;
						}
});
/** End declaration of TestContext class */


/**
 * Populate the TestContext namespace with functions for setting up sets of TestContext objects.
 * These are essentially "static" functions.
 * To use these, call TestContext.functionNamer()
 *
 * Note that private functions are "private" in that they are only visible by functions defined
 * in the same enclosure as them.
 */ 
TestContext.Extend( ( function(){
	function setup (
		options
	,	testContextOne
	,	testContextTwo
	) {
		//WL('TestContext.setup("{0}","{1}","{2}")'.Format( options, testContextOne, testContextTwo ) );
		var pop =  _formatIndividualOption( options.populate )
		,	link = _formatIndividualOption( options.link )
		,	linkAll = Array.valueExists( link, 'all' )	
		,	setupContexts = {}
		;
		
		
		if( !options.filesystem || !pop.length ) return setupContexts;
		
		testContextOne.setup( 'A' );
		setupContexts['A']=testContextOne;
		_populate( options, setupContexts['A'].getDir('A') );
		
		if( !link.length ) return setupContexts;
		
		testContextTwo.setup( 'B' );
		setupContexts['B']=testContextOne;
		_populate( options, setupContexts['B'].getDir('B') );
		
		availableLinks = ['symbolic','junction','hard'];
		for( var k in availableLinks ) {
			if( linkAll || Array.valueExists( link, availableLinks[k] ) ) { 
				_linkToAll( 
					availableLinks[k]
					, $$.fso.BuildPath( setupContexts['B'].getDir('B'), availableLinks[k] ) 
					, setupContexts['A'].getDir('A')
				);
				_linkToAll( 
					availableLinks[k]
					, $$.fso.BuildPath( setupContexts['A'].getDir('A'), availableLinks[k] ) 
					, setupContexts['B'].getDir('B')
				);
			}
		}
		
		return setupContexts;
	}
	
	function destroy (
		testContexts
	) {
		//WL('TestContext.destroy()'); return;
		for( var k in testContexts ) {
			testContexts[k].destroy( k );
		}
	}
	
	function _populate(
		options
	,	basePath
	) {
		// Be forgiving with our input
		var pop = _formatIndividualOption( options.populate )
		,	link = _formatIndividualOption( options.link )
		;
		
		function copyResource( res ){ 
			copy( 
				$$.fso.BuildPath( '{$ScriptPath}resources'.Format() , res ),
				basePath
			); 
		}
		var popAll = Array.valueExists( pop, 'all' );
		
		if( popAll || Array.valueExists( pop, 'file' ) ) { copyResource( 'existing_file' ); }
		if( popAll || Array.valueExists( pop, 'txt' ) ) { copyResource( 'file.txt' ); }
		if( popAll || Array.valueExists( pop, 'csv' ) ) { copyResource( 'file.csv' ); }
		if( popAll || Array.valueExists( pop, 'exe' ) ) { copyResource( 'existential.exe' ); }
		
		if( !options.deep && ( popAll || Array.valueExists( pop, 'dir' ) ) ) {
			( op = Object.clone( options ) ).deep = true;
			mkdir( ( fol = $$.fso.BuildPath( basePath, 'existing_folder' ) ) );
			_populate( op, fol);
		}
		
		if( !options.deep && link.length ) {
			var linkAll = Array.valueExists( link, 'all' );
			
			if( linkAll || Array.valueExists( link, 'symbolic' ) ) { mkdir( $$.fso.BuildPath( basePath, 'symbolic' ) ); }
			if( linkAll || Array.valueExists( link, 'junction' ) ) { mkdir( $$.fso.BuildPath( basePath, 'junction' ) ); }
			if( linkAll || Array.valueExists( link, 'hard' ) ) { mkdir( $$.fso.BuildPath( basePath, 'hard' ) ); }
		}
	}
	
	function _linkToAll( type, from, to ) {
		var targetBase = $$.fso.GetFolder( to )
		;
		// Add files to targets files
		for( var tFiles = new Enumerator( targetBase.Files ); !tFiles.atEnd(); tFiles.moveNext() ) {
			_tryLinkFile(
					type
				,	$$.fso.BuildPath( from, ( tFiles.item() ).Name )
				,	tFiles.item().Path
			);
		}
		// Add child folders (NOT recursive)
		for( var tFolders = new Enumerator( targetBase.SubFolders ); !tFolders.atEnd(); tFolders.moveNext() ) {
			_tryLinkFolder(
					type
				,	$$.fso.BuildPath( from, tFolders.item().Name )
				,	tFolders.item().Path
			); 
			
		}
	}
	
	function _tryLinkFile( type, from, to ) {
		switch( type ) {
			case 'symbolic':
				return $$.cmd( 'MKLINK "{0}" "{1}"', from, to );
			case 'hard':
				// ensure that they have the same root before making this one work
			default:
				return false;
		}
	}
	function _tryLinkFolder( type, from, to ) {
		switch( type ) {
			case 'symbolic':
				return $$.cmd( 'MKLINK /D "{0}" "{1}"', from, to );
			case 'junction':
				return $$.cmd( 'MKLINK /J "{0}" "{1}"', from, to );
			case 'hard':
				// ensure that they have the same root before making this one work
			default:
				return false;
		}
	}
	
	function _formatIndividualOption( option ){
		return (
			( option === true ) ? ['all'] : // boolean true means all
			( option === false || Object.isUndefined( option ) ) ? [] : // boolean/unset false means none
			( Object.isString( option ) ) ? [ option ] : // a string means one thing
			( Object.isArray( option ) ) ? option : // perfect. Accept as-is.
			Assert.Fail( 'Cannot parse test Case options into something usable.' )
		);
	}
	
	return {
		'setup':setup
	,	'destroy':destroy
	}
})());

/**
 * Create a custom stack class for TestContext objects.
 * This allows us to do type interferance and to require items in the stack to
 * be instances of TestContext or its child classes.
 */
var TestContextStack = Class.create( Stack, {
	/**
	 * Add a TestContext to the stack. 
	 * @param {TestContext} the TestContext object we're adding.
	 * 
	 * @return {TestContextStack} returns this
	 */
	'addItem':	function( $super, itemToAdd ){
					if( !( itemToAdd instanceof TestContext ) )
						throw new Error('This stack only accepts items that are an instance of TestContext.');
					return $super( itemToAdd );
				}
});
/** End declaration of TestContextStack class */




/**
 * Extend the base class for mountable test contexts, such as shares and dfs. This is an incomplete
 * class definition and must be extended with mountVolume and unmountVolume methods, or else Error
 * objects will be thrown.
 * @abstract
 */
eval(include("{$ScriptPath}lib\\DriveLetterPool.inc.js"));
var TestContext_Mountable = Class.create( TestContext, {
	
	/**
	 * Mount a Volume
	 * @param {String} address
	 * @param {String} mountPoint
	 * 
	 * @return {void}
	 * @throws {Error} descriptive error if a blocking problem is encountered
	 */
	'incrementMountHolds':
						function TestContextMountable_incrementMountHolds() {  //WL('TestContextMountable::incrementMountHolds()');
							// no existing holds? mount.
							if( this.mountHolds == 0 ){
								this.rootPath = this._mount(
									this.address, 
									( this.mountPoint = DriveLetterPool.createHold( this ) )
								);
							}
							this.mountHolds++;
						},
	
	/**
	 * Unmount a Volume
	 * @param {String} address
	 * @param {String} mountPoint
	 * 
	 * @return {void} 
	 * @throws {Error} descriptive error if a blocking problem is encountered
	 */
	'decrementMountHolds':
						function TestContextMountable_decrementMountHolds() {  //WL('TestContextMountable::decrementMountHolds()');
							if( this.mountHolds < 1 ) {
								Assert.Fail('Cannot decrement mount holds when there are zero.');
							}
							this.mountHolds--;
							
							// No holds left? unmount
							if( this.mountHolds < 1 ){
								this._unmount( this.address, this.mountPoint );
								DriveLetterPool.releaseHold( this );
								this.rootPath = null;
								this.mountPoint = null;
							}
						},
	
	/**
	 * Do the actual mounting.
	 * @param {String} address
	 * @param {String} mountPoint
	 */
	'_mount':			function(
							address
						,	mountPoint
						){ 
							$$( 'NET USE {1}: {0}',  address, mountPoint );
							return mountPoint + ':\\';
						},
	/**
	 * Do the actual dismount.
	 * @param {String|Null} address - that was mounted
	 * @param {String|Null} mountPoint - that needs unmounting
	 */
	'_unmount':			function(
							address
						,	mountPoint
						){ 
							if( !mountPoint ) {
								Assert.Fail('mountPoint must be supplied.\n TODO: lookup mountpoint using address');
							}
							$$( 'NET USE {1}: /DELETE /Y',  address, mountPoint );
						},
	/**
	 * Mount the files volume and call parent's version of this method using $super
	 *
	 * @returns {void}
	 * @throws {Error} if blocking problem occurs
	 */
	'setup':			function( $super, key ) {
							this.incrementMountHolds();
							return $super( key );
						},
						
	/**
	 * Unmount the files volume and call parent's version of this method using $super
	 *
	 * @returns {void}
	 * @throws {Error} if blocking problem occurs
	 */
	'destroy':		function( $super, key ) {
							var ret = $super( key );
							this.decrementMountHolds(); 
							return ret;
						},
						
	/**
	 * Returns the physical path to the files directory
	 *
	 * @returns {String} filesDir
	 */
	'getDir':			function(
							$super
						,	key
						) {
							if( !this.mountHolds ) Assert.Fail("Can't getDir() because it's not mounted.");
							return $super( key );
						},
	
	/**
	 * Called when created with 'new' keyword. Set up the object.
	 * @param {String} scriptsAddress
	 * @param {String} scriptsMountPoint
	 * @param {String} filesAddress
	 * @param {String} filesMountPoint
	 * 
	 * @return {TestContextMountable} part of the constructor, so it returns the constructed object
	 */
	'initialize':		function(
							$super
						,	name
						,	address
						) {
							$super( name, null );
							this.address = address.replace(/\\$/,''); // strip trailing slash.
							this.mountHolds = 0;
							
							return this;
						}
});
/** End declaration of TestContextMountable class */

var TestContext_Mountable_WithCredentials = Class.create( TestContext_Mountable, {
	'initialize':		function(
							$super
						,	name
						,	address
						,	user
						,	password
						) {
							$super( name, address );
							this.credentials = {
								'user':		user
							,	'password':	password
							};
							return this;
						}
	/**
	 * Do the actual mounting.
	 * @param {String} address
	 * @param {String} mountPoint
	 */
,	'_mount':			function(
							address
						,	mountPoint
						){ 
							var command = 'NET USE {1}: {0} /USER:{2} "{3}"'.Format(
									address, 
									mountPoint,
									this.credentials.user,
									this.credentials.password
							);
							$$( command );
							return mountPoint + ':\\';
						}
} );