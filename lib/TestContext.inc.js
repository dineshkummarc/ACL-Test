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
	'getFilesDir':		function() {
							if( !this.filesDir ){
								this.filesDir = $$.fso.BuildPath(
									this.rootPath,
									$$.fso.GetTempName()
								);
							}
							return this.filesDir;
						},
	
	/**
	 * Returns the physical path to the scripts directory
	 *
	 * @returns {String} scriptsDir
	 */
	'getScriptsDir':	function() {
							if( !this.scriptsDir ){
								this.scriptsDir = $$.fso.BuildPath(
									this.rootPath,
									$$.fso.GetTempName()
								);
							}
							return this.scriptsDir;
						},
	
	/**
	 * Sets up the files directory with a number of resources so the script can test against them
	 * Currently calls global function of same name.
	 * TODO: Bring global function in to the TestContext object
	 *
	 * @returns {void}
	 * @throws {Error} if blocking problem occurs
	 */
	'setupFilesDir':	function() { //WL('TestContext::setupFilesDir() '+ this.getFilesDir() );
							return setupFilesDir( this.getFilesDir() );
						},
	
	/**
	 * Empties the files directory.
	 * Deletes and resets the stored this.filesdir
	 *
	 * @returns {void}
	 * @throws {Error} if blocking problem occurs
	 */
	'destroyFilesDir':	function() {
							$$.withRetry( 'CMD /C "RD /S /Q "'+this.getFilesDir()+'""' );
							delete this.filesDir;
							return true;
						},
	
	/**
	 * Sets up the scripts directory by making sure that it does, in fact, exist.
	 *
	 * @returns {void}
	 * @throws {Error} if blocking problem occurs
	 */
	'setupScriptsDir':	function() {
							return truncateDir.withRetry( this.getScriptsDir() );
						},
	
	/**
	 * Empties the scripts directory.
	 * Deletes and resets the stored this.scriptsDir
	 *
	 * @returns {void}
	 * @throws {Error} if blocking problem occurs
	 */
	'destroyScriptsDir':function() {
							$$.withRetry( 'CMD /C "RD /S /Q "'+this.getScriptsDir()+'""' );
							delete this.scriptsDir;
							return true;
						},
	
	/**
	 * Empties the directory passed to it as an argument.
	 * Currently calls global function of same name
	 *
	 * @returns {void}
	 * @throws {Error} if blocking problem occurs
	 */
	'truncateDir':		function( dirToTruncate ) {
							return truncateDir( dirToTruncate );
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
	'setupFilesDir':	function( $super ) {
							this.incrementMountHolds();
							return $super();
						},
						
	/**
	 * Unmount the files volume and call parent's version of this method using $super
	 *
	 * @returns {void}
	 * @throws {Error} if blocking problem occurs
	 */
	'destroyFilesDir':	function( $super ) {
							var ret = $super();
							this.decrementMountHolds(); 
							return ret;
						},
						
	/**
	 * Mount the scripts volume and call parent's version of this method using $super
	 *
	 * @returns {void}
	 * @throws {Error} if blocking problem occurs
	 */
	'setupScriptsDir':	function( $super ) {
							this.incrementMountHolds();
							return $super();
						},
						
	/**
	 * Unmount the scripts volume and call parent's version of this method using $super
	 *
	 * @returns {void}
	 * @throws {Error} if blocking problem occurs
	 */
	'destroyScriptsDir':function( $super ) {
							var ret = $super();
							this.decrementMountHolds();
							return ret;
						},
	
	/**
	 * Returns the physical path to the files directory
	 *
	 * @returns {String} filesDir
	 */
	'getFilesDir':		function(
							$super
						) {
							if( !this.mountHolds ) Assert.Fail("Can't getFilesDir() because it's not mounted.");
							return $super();
						},
	
	/**
	 * Returns the physical path to the scripts directory
	 *
	 * @returns {String} filesDir
	 */
	'getScriptsDir':	function(
							$super
						) {
							if( !this.mountHolds ) Assert.Fail("Can't getScriptsDir() because it's not mounted.");
							return $super();
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
							name,
							address
						) {
							this.name = name;
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