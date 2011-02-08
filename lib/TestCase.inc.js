var TestCase = Class.create( TestBenchFactor, {

	/**
	 * Function to run as the constructor when using the new keyword
	 * @param pathToPhptFile
	 * 
	 * @returns {TestCase} new TestCase object
	 * @throws {Error} if pathToPhptFile does not exist
	 */
	'initialize':	function( pathToPhptFile ){
						this.phptPath = pathToPhptFile.Format();
						// 
						this._setUniqueKey();
					},
	'_setUniqueKey':function() {
						this.uniqueKey = this.phptPath.
							split( '\\' ).
							pop().
							split( '.' ).
							slice( 0, -1 ).
							join( '.' )+
							'-'+
							Math.random.fromRange( 
									Math.pow(2,10) , Math.pow(2,20) 
								).toString(16)
					},
	/**
	 * Override the description method.
	 */
	'describe':		function(){
						return getRelativePath( 
								'{$ScriptPath}phpt\\'.Format() , 
								this.phptPath 
							).replace(/^(\.\.\\)+/,'').replace(/\.phpt?$/,'');
					},
	/**
	 * Get a section. Runs this.parse()
	 * @param {String} sectionName
	 * 
	 * @return {String|Boolean} returns section if available, false on failure.
	 */
	'getSection': 	function( sectionName ){
						this.parse();
						sectionName = sectionName.toUpperCase();
						if( typeof( this.phptParts[sectionName] )=='undefined'){
							return false;
						}
						return this.phptParts[sectionName];
					},
					
	/**
	 * Save the section to file.. Runs this.getSection()
	 * @param {String} sectionName
	 * @param {String} basePath
	 * @param {String} suffix
	 *
	 * @return {String} fullPath;
	 * @throws {Error} if file can't be saved.
	 */
	'saveSection':	function( sectionName, basePath, suffix ){
						if( !$$.fso.folderExists( basePath )) { $$.cmd('mkdir "{0}"', basePath); }
						var fullPath = $$.fso.BuildPath( basePath, ( this.uniqueKey + suffix ) );
						with (new ActiveXObject("ADODB.Stream")) {
							type = 2;
							CharSet = 437;
							open();
							WriteText( BinaryFile._streamTextToBinaryData( this.getSection( sectionName ) ) );
							saveToFile(fullPath, 2);
							close();
						}
						
						return fullPath;
					},
	/**
	 * Save all sections to file.
	 */
	'save':			function( basePath, extension ) {
						if( !$$.fso.folderExists( basePath )) { $$.cmd('mkdir "{0}"', basePath); }
						extension = extension || 'phpt'; // Provide sensible default
						//WL(extension);
						//WL(this.phptPath.split( '\\' ).pop());
						//WL((this.phptPath.split( '\\' ).pop().split( '.' ).slice( 0, -1 )));
						//WL(this.phptPath.split( '\\' ).pop().split( '.' ).slice( 0, -1 ).push(extension));
						var fullPath = $$.fso.BuildPath( 
								basePath,
								// +-------Just-the-name--------+ +-----Strip-Extension-----+ +--Add-specified-extension--+
								this.phptPath.split( '\\' ).pop().split( '.' ).slice( 0, -1 ) + '.' + extension
							)
						,	out = $$.fso.CreateTextFile( fullPath, true, true )
						;
						for( var sectionName in this.phptParts ) {
							if( this.phptParts.hasOwnProperty( sectionName ) ) {
								out.WriteLine( '--' + sectionName.toUpperCase() + '--' );
								out.WriteLine( this.getSection(sectionName) );
							}
						}
						out.Close();
					},
	/**
	 * Load a string into a section. Runs this.parse()
	 * @param {String} sectionName
	 * @param {String} newValue
	 * 
	 * @return {void}
	 */	
	'loadSection': 	function( section, newValue ){
						this.parse();
						this.phptParts[section] = newValue;
					},
	
	/**
	 * Remove a section. Runs this.parse()
	 * @param {String} section
	 * 
	 * @return {void}
	 */
	'unloadSection':function( section ){
						this.parse();
						delete this.phptParts[section];
					},
	
	/**
	 * Parse the loaded phptFile
	 * 
	 * @return {Object} - returns this.phptParts
	 */	
	'parse':		function(){ 
						if( typeof(this.phptParts)=='object' )
							return this.phptParts;
						
						this.phptParts = {
							'TEST'  :'(unnamed test)'
						}
						
						try {
							var phptFile = $$.fso.openTextFile( this.phptPath );
							var phptRaw = phptFile.ReadAll();
							phptFile.close();
						} catch( e ) {
							this.borkedReasons = ['Cannot read file: "'+this.phptPath+'"'];
							return;
						}
						// split the string into lines
						var tphp = phptRaw.split( '' ).reverse().join( '' );
						var phpLines = new Array();
						while( tphp.length ){
							//find next linebreak
							nextBreak = tphp.search( /.(\n\r|\r|\n)/ ); // /n/r because we're searching a reversed string
							//slice string and push result onto array
							if( nextBreak == -1 )
								nextBreak = tphp.length;
							else nextBreak++;
							phpLines.unshift(
								tphp.slice(
									0,
									nextBreak
								).split( '' ).reverse().join( '' )
							);
							tphp = tphp.substr( nextBreak );
						}
						
						// Supply a line parser for "#!includes path\to.file" and possible other stuff.
						var parseLine = function( line, context ) {
							var matches = false
							;
							if( matches=line.match( /^\#\!include ([a-zA-Z\\0-9_\-.]*)/ ) ){
								try {
									var inc = $$.fso.BuildPath( context, matches[1] )
									,	p = $$.fso.GetParentFolderName( inc )
									,	r = ''
									,	f = $$.fso.OpenTextFile( inc, 1 /* FOR_READING */ )
									;
									while( !f.AtEndOfStream ){
										l = f.ReadLine();
										r += parseLine( l, p );
										r += l;
									}
									return r;
								} catch (e) {
									return line;
								}
							}
							return line;
						}
						
						// iterate through those lines
						
						var section;
						while( phpLines.length ) {
							lineString = phpLines.shift();
							// Match the beginning of a section
							if( matches = lineString.match( /^--([A-Z_]+)--/ ) ) {
								section = matches[1];
								this.phptParts[section] = '';
								// load up the diff engine for this test case.
								switch( section ){
									case 'EXPECT':
										this.diffEngine = TestExpect;
										break;
									case 'EXPECTF':
										this.diffEngine = TestExpectF;
										break;
									case 'EXPECTREGEX':
										this.diffEngine = TestExpectRegEx;
										break;
								}
								continue;
							}
							
							// Add to the section text
							this.phptParts[section] += parseLine( 
								lineString
							,	$$.fso.GetParentFolderName( 
									$$.fso.BuildPath( 
										$$.fso.GetAbsolutePathName('c:')
									,	this.phptPath 
									)
								) 
							);
						}
						
						// cleanup
						for( section in this.phptParts ) {
							if( section == 'POST' ){
								// strip the LAST new line only
								this.phptParts[section] = this.phptParts[section].replace( /\r?\n$/m,'' );
							} else {
								// strip whitespace on both sides
								this.phptParts[section] = this.stripIllegalWhitespace( this.phptParts[section] );
							}
							// convert line endings to unix ones
							this.phptParts[section] = this.convertLineEndings( this.phptParts[section] );
						}
						
						return this.phptParts;
					}
	/**
	 * Detect unsupported PHPT features
	 * 
	 * @return {Array|false} array of reasons or false
	 */
,	detectUnsupportedFeatures: function TestCase_detectUnsupportedFeatures(){
		this.parse();
						
		var ret = []
		,	unsupportedSections = [
				'FILEOF',
				'FILE_EXTERNAL',
				'REDIRECTTEST',
				'ENV',
				'GET',
				'PUT',
				'POST',
				'POSTRAW',
				'COOKIE',
				'EXPECTHEADERS'
			]
		;
		
		for( var i = 0; i < unsupportedSections.length; i++ ) { 
			if( this.phptParts.hasOwnProperty( unsupportedSections[i] ) ) {
				ret.push( 'unsupported section: '+unsupportedSections[i] );
			}
		}
		
		return ( ret.length ? ret : false );
	}
	
	/**
	 * Detect borked PHPT files
	 * 
	 * @return {Array|false} array of reasons or false
	 */
,	detectBork: function TestCase_detectBork() {
		this.parse();
		
		if( this.borkedStatus ) return this.borkedReasons;
		
		var ret = []
		, 	sectionGroups = {
				REQUIRED: [
						['FILE','FILEOF','FILE_EXTERNAL']
					,	['EXPECT','EXPECTF','EXPECTREGEX']
					,	['TEST']
				]
			,	OPTIONAL: [
						['POST','POSTRAW']
					,	['CREDIT','CREDITS']
				]
			}
		;
		
		for( var req in sectionGroups ) {
			for( var i = 0; i < sectionGroups[req].length; i++ ) {
				var count = 0;
				for( var j=0; j < sectionGroups[req][i].length; j++ ) {
					if( this.phptParts.hasOwnProperty( sectionGroups[req][i][j] ) ) count++;
				}
				if( req=='REQUIRED' && !count ) ret.push( 'missing required section: [' + sectionGroups[req][i] + ']' );
				if( count > 1 ) ret.push( 'duplicate sections: [' + sectionGroups[req][i] + ']' );
			}
		}
		
		return ( ret.length ? ret : false );		
	}
,	
	/**
	 * We have introduced a new section to allow the test to supply arguments for setting up its scenario.
	 * The format of this section is like php.ini. Lines beginning with semicolons are comments.
	 * Spaces are currently not supported: "key = value" makes an error.
	 * 
	 * --PFTT--
	 * ;this is a comment
	 * key=value
	 * key=onevalue,twovalue,threevalue,"fourvalue,stillfourvalue",five
	 */
	'getOptions':function() {
						if( this.pfttOptions ) {
							return this.pfttOptions;
						}
						
						// If a pftt section doesn't exist, return empty object.
						if( !( optionsRaw = this.getSection('pftt') ) ) {
							this.pfttOptions = {};
							return this.pfttOptions;
						}
						
						/**
						 * Internal function for converting a string to an appropriate value.
						 * 
						 * Boolish values return applicable Boolean value
						 * Comma-delimited strings return an array of items, each of which are parsed with this function
						 * Numeric strings are returned properly cast 
						 * 		# Avoid Octal values: JScript parses them as base10. (Hex OK) -Ryan
						 * Quoted strings are stripped of their quotes.
						 */
						function stringVal2realVal( str ){
							
							// if the val is boolish, make it boolean
							if( str.match(/^(true|on|yes|enabled)$/i) ) {
								return true;
							} if( str.match(/^(false|off|no|disabled)$/i) ) {
								return false;
							}
							
							// if the val is comma-delimited, split to array then stringVal2realVal each item.
							// Split RegExp credit Guillaume Roderick ( http://programmersheaven.com/user/Jonathan/blog/73-Splitting-CSV-with-regex/ )
							var arr;
							if( ( arr = str.split(/, ?(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/g) ).length > 1 ) {
								rArr = new Array();
								for( var k in arr ) {
									rArr.push( stringVal2realVal( arr[k]+'' ));
								}
								return rArr;
							}
							
							// if the val is a number, cast it as such
							if( ( str - 0 ) == str && str.length > 0 ) {
								return ( str - 0 );
							}
							
							// if the val is quoted, strip the quotes
							if( str != ( unq = str.replace(/^"([^"]+)"$/,'$1') ) ) {
								return unq;
							}
							
							// if the val is zero-length, return null
							if( str.length == 0 ) {
								return null;
							}
							
							return str;
						}
						
						optionsArray = optionsRaw.split(/(\n|\r|\r\n)+/);
						this.pfttOptions = {};
						
						for( var i in optionsArray ){
							// if it begins with a semicolon, skip it.
							if( /^;/.test( optionsArray[i] ) ) {
								continue;
							}
							
							// split on equals. the part before is the key.
							var k = optionsArray[i].match(/^[A-Z_][A-Z0-9_]*(?=\=)/i)+'';
							//var k = ( var spl = optionsArray[i].split( '=' ) ).shift();
							// get the realVal from this stringVal.
							var v = stringVal2realVal( optionsArray[i].slice( k.length + 1 ) );
							
							// set pfttOptions[key]=value
							this.pfttOptions[k] = v;
						}
						
						return this.pfttOptions;
					},
	/**
	 * Attach the result string.
	 * @param {String} resultString
	 */
	'attachResultString': function( resultString ){
						this.resultString = resultString;
					},
	/**
	 * Some functions are destructive. Reset forces the test file to be re-parsed. 
	 * 
	 * @return {void}
	 */
	'reset':		function() {
						if('phptParts' in this)
							delete this.phptParts;
						if('resultString' in this)
							delete this.resultString;
						if('_diff' in this)
							delete this._diff;
						this._setUniqueKey();
						return this;
					},
	
	/**
	 * To get around changes in configuration, we need to be able to change the tests based on
	 * configuration. Because PHPT files are syntactically correct PHP and we didn't want to break
	 * this, we will replace certain extra-magical constants, if they're supplied. This function iterates
	 * through the existing sections and replaces every occurance of ___KEY___ with 'value'. It is smart 
	 * enough to single-quote the string if in the FILE or SKIPIF section, while direct replacing in other 
	 * sections.
	 *
	 * @param {Object} newValues - {'KEY':'value'}
	 *
	 * @return {void}
	 */
	'replaceConstants':	function( newValues ){
							this.parse();
							for( var section in this.phptParts ){
								for( var varKey in newValues ){
									switch( section ){
										case 'FILE':
										case 'SKIPIF':
											varVal = "'"+newValues[varKey].replace( /(['\\])/g,'\\$1' )+"'";
											break;
										default:
											varVal = newValues[varKey];
									}
									var varKeyRegExp = new RegExp( '___'+varKey+'___', 'g' );
									this.phptParts[section] = this.phptParts[section].replace( varKeyRegExp, varVal );
								}
							}
							return this;
						},

	/**
	 * Test a result to see if it works against EXPECT, EXPECTF, or EXPECTREGEX 
	 * depending on which is provided.
	 *
	 * @return {Boolean} true on success, false on fail.
	 * @throws {Error} if no valif expect sections are present
	 */	
	'testResult':	function() {
						var diff = this.generateDiff();
						return diff.isPass();
					},
	
	/**
	 * generate the appropriate TestExpect object
	 * 
	 * @return {TestExpect}
	 */
	'generateDiff':	function(){
						if( !Object.isUndefined( this._diff ) ) return this._diff;
						
						if( Object.isUndefined( this.resultString ) ) {
							Assert.Fail('Cannot generte diff when result string is not attached.');
						}
						// Find the Expect-ish section and use it
						for( var section in this.phptParts ){
							if( section.match(/^EXPECT(F|REGEX)?$/) ) {
								this._diff = new this.diffEngine( this.phptParts[ section ], this.resultString );
								break;
							}
						}
						if( Object.isUndefined( this.resultString ) ) {
							Assert.Fail('Cannot generate diff when expect-ish section not found.');
						}
						
						return this._diff;
					},
	
	/**
	 * Convert all funky line endings to unix newlines.
	 * Yes, we're on Windows, but git uses unix-style line endings
	 * and we're saving to Windows-style endings, so there is bound to be confuxion
	 * unless we clean it up.
	 * @param {String} str
	 *
	 * @return {String}
	 */
	'convertLineEndings':	function( str ){
								return str.replace( /\r(\n)?/g, '\n' );
							},

	/**
	 * Strip Illegal whitespace from either end. Clone of PHP's trim with default settings.
	 * @param {String} str
	 * 
	 * @return {String}
	 */	
	'stripIllegalWhitespace':function( str ){
								str = str.replace( /^(\x09|\x20|\x0A|\x0D|\x00|\x0B)+/g, '' );
								for( var i = str.length - 1; i >= 0; i-- ){
									if ( /(\x09|\x20|\x0A|\x0D|\x00|\x0B)/.test( str.charAt( i ) ) ) {
										str = str.substring( 0, i );
										continue;
									}
									break;
								}
								return str;
							},
	
	/**
	 * Output a string as hex, separated by spaces
	 * @param {String} str
	 *
	 * @param {String} 
	 */
	'ordHex':			function( str ){
							var r=''; var c=''; var d='00';
							for( var i=0; i<str.length; i++ ){
								c = str.charCodeAt( i ).toString( 16 ).toUpperCase(); 
								r+= d.substring( 0, 2-c.length )+c+' ';
							}
							return r;
						}
});
/** End declaration of TestCase class */



/**
 * Create a custom Stack class for TestCase objects.
 * This allows us to do type interferance and to require items in the Stack to
 * be instances of TestCase or its child classes.
 */
var TestCaseStack = Class.create(Stack,{
	/**
	 * Add a TestCase to the Stack. 
	 * @param {TestCase} the TestCase we're adding.
	 * 
	 * @return {TestCaseStack} returns this
	 */
	'addItem':	function( $super, itemToAdd ){
					if( !( itemToAdd instanceof TestCase ) )
						throw new Error('This Stack only accepts items that are an instance of TestCase.');
					return $super( itemToAdd );
				},
	/**
	 * Add all matching items recursively.
	 * @param {String} path
	 * @param {RegExp} optional positivePattern default /\.php$/
	 * @param {RegExp} optional negativePattern
	 *
	 * @return {TestCaseStack} this
	 */
	'loadFromPath':	function( path, positivePattern, negativePattern ){
						path = path.Format();
						if( !folderExists( path ) ){
							throw new Error( "Couldn't load from path. Path provided not found: \n\tCWD : " + $$.WSHShell.CurrentDirectory + "\n\tPATH: " + path );
						}
						var f = $$.fso.GetFolder( path );
						var fC = new Enumerator( f.files );
						for(; !fC.atEnd(); fC.moveNext() ) {
							var tF = fC.item();
							if( tF.Name.match( ( typeof(positivePattern)=='undefined' ? /\.phpt$/ : positivePattern ) ) && 
								( typeof( negativePattern )=='undefined' || !tF.Path.match( negativePattern ) ) 
									) {
								this.addItem( new TestCase( tF.Path ) );
							}
						}
						// call function on subdirs too.
						var fS = new Enumerator( f.subFolders );
						for(; !fS.atEnd(); fS.moveNext() ) {
							this.loadFromPath( fS.item().Path, positivePattern, negativePattern );
						}
						return this;
					},
	/**
	 * Add all items in the phpt folder that have been changed since the given commit.
	 * @param {String} optional commit default 'develop'
	 * @param {RegExp} optional positivePattern default /\.php$/
	 * @param {RegExp} optional negativePattern
	 *
	 * @return {TestCaseStack} this
	 */
	'loadChangedFiles':	function( commit, positivePattern, negativePattern ){
							var commit = ( ( typeof( commit ) == 'undefined' ) ? 'develop' : commit );
							var files = $$( 'git diff --name-only -z "{0}" -- phpt', commit ).split( String.fromCharCode( 0x00 ) );
							for(var idx in files){
								var file = files[idx];
								if( file.match( ( typeof(positivePattern)=='undefined' ? /\.phpt$/ : positivePattern ) ) && 
									( typeof( negativePattern )=='undefined' || !file.match( negativePattern ) ) 
										) {
									this.addItem( new TestCase( tF.Path ) );
								}
							}
							return this;
						}
});
/** End declaration of TestCaseStack class */

