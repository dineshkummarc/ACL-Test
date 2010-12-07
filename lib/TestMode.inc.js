/**
 * A basic class to define the public functions for all test modes
 * These should all be overridden by sub-classes.
 * @abstract
 */
var TestMode = Class.create( TestBenchFactor, {

	/**
	 * Setup function ensures that the TestMode is set up for running the script
	 * 
	 * @return {Boolean} true == success; false == soft failure
	 * @throws {Error} describing any blocking error
	 */
	'setup':		function(
					) { 
						this._applyIni();
						this.isSetup( true );
						return true;
					},
	
	/**
	 * Setup only if it is not already setup. Return true if we have to do work.
	 * 
	 * @return {Boolean} true == "I set you up"; false == "I didn't set you up"
	 */
	'doSetup':		function(
					) { 
						if( this.isSetup() ){
							return false;
						}
						return this.setup();
					},
	
	/**
	 * Run the script and return its output.
	 * @param {String} physicalPathToScript
	 * 
	 * @return {String} output of executed script
	 * @throws {Error} describing any blocking error
	 */
	'runScript':	function( 
						physicalPathToScript 
					) { 
						throw new Error(0x7,'TestMode::runScript() not defined');
					},
	/**
	 * Apply the specified ini, unless it evaluates to false and tell us
	 * whether or not an ini was applied.
	 * @param {String|Boolean} ini
	 * 
	 * @throws {Error} describing any blocking error
	 */
	'doApplyIni':	function(
						ini
					) {
						if( ini ) {
							this._applyIni( ini );
							return true;
						} else {
							return false;
						}
					},
	/**
	 * Conditionally reset the ini.
	 * @param {String|Boolean} ini
	 * 
	 * @throws {Error} describing any blocking error
	 */	
	'doResetIni':	function(
						didSetupIni
					) {
						if( didSetupIni ) {
							this._applyIni();
						}
						return didSetupIni;
					},
	/**
	 * Apply the specified ini. Should be overridden in child classes.
	 * @param {String} ini
	 * 
	 * @throws {Error} describing any blocking error
	 */
	'_applyIni':	function(
						ini
					) {
						throw new Error(0x8,'TestMode::applyIni() is not defined')
					},
	
	/**
	 * Get the base INI for this TestMode.
	 * 
	 * @returns {Array} ini configuration, one line per array key
	 */
	'_getIni':		function(
					) {
						return [];
					},
	
	/**
	 * Destroy function ensures that the TestMode is no longer set up for running the script
	 * 
	 * @return {Boolean} true == success; false == soft failure
	 * @throws {Error} describing any blocking error
	 */
	'destroy':		function(){ 
						this.isSetup( false );
						return true;
					},
	
	/**
	 * Destroy only if it a) isSetup() and b) the parameter passed is true.
	 * @param {Boolean} param - 
	 * 
	 * @return {Boolean} true == "I destroyed you"; false == "I didn't destroy you"
	 */
	'doDestroy':	function( 
						param
					) {
						if( this.isSetup() && param ){
							return this.destroy();
						}
						return false;
					},
	
	/**
	 * Getter/setter for this._isSetup
	 * @param {Boolean} optional value - if present, set.
	 * 
	 * @return {Boolean} value, after setting
	 */
	'isSetup':		function( 
						value
					) {
						if( !Object.isUndefined( value ) ) {
							this._isSetup = value;
						} else if( Object.isUndefined( this._isSetup ) ) {
							this._isSetup = false;
						}
						return this._isSetup;
					}
});
/** End declaration of TestMode abstract base class */




/**
 * Create a custom stack class for TestModes.
 * This allows us to do type interferance and to require items in the stack to
 * be instances of TestMode or its child classes.
 */
var TestModeStack = Class.create(Stack,{
	/**
	 * Add a TestMode to the stack. 
	 * @param {TestMode} the TestMode we're adding.
	 * 
	 * @return {TestModeStack} returns this
	 */
	'addItem':	function( 
					$super
				,	itemToAdd 
				) {
					if( !( itemToAdd instanceof TestMode ) )
						throw new Error('This stack only accepts items that are an instance of TestMode.');
					return $super( itemToAdd );
				}
});
/** End declaration of TestModeStack class */


/**
 * Create a namespace for constants relating to our PHP build.
 */
PHP = new ConstantNamespace();
// Compiler Constants
PHP.registerConstant('VC6');
PHP.registerConstant('VC9');
PHP.registerConstant('VC6orVC9', PHP.VC6|PHP.VC9 );
// Thread Safety Constants
PHP.registerConstant('NTS');
PHP.registerConstant('ZTS');
PHP.registerConstant('NTSorZTS', PHP.NTS|PHP.ZTS );



/**
 * Configuring the test modes has always been error-prone and tedious, so this function namespace should
 * help things dramatically. To use, see the build() method.
 */
TMSB = TestModeStackBuilder = new ( Class.create( ConstantNamespace, {
	'initialize':		function(
						) {
							this.objects = {};
						}
	/**
	 * Override ConstantNamespace's version of this function for our own liking.
	 */
,	'registerConstant':	function(
							$super
						,	constantName
						,	VC6orVC9bit
						, 	NTSorZTSbit
						,	executableName
						,	TestModeClass
						) {
							constantName = constantName.toUpperCase();
							var val = $super( constantName );
							this.objects[constantName]={
								'compiler':			VC6orVC9bit
							,	'threadSafety':		NTSorZTSbit
							,	'executableName':	executableName
							,	'TestMode':			TestModeClass
							}
							return val;
						}
	/**
	 * Get a TestModeStack that contains all possible testMode* objects
	 * from the path and the specified bits.
	 * @param {String} path - the path to a folder that contains one or more php builds
	 *                      - builds should be in descriptive directories, as-built, 
	 *                      - e.g. php-5.3.99-dev-nts-Win32-VC9-x86
	 * @param {Integer} bit @optional - The bit value to build collisions with.
	 * @param {String} desc @optional - a description to prepend to the description of each mode.
	 */
,	'build':			function(
							path
						,	bit //  = TMSB.ALL
						,	desc // = ''
						) { 
							bit = bit || this.ALL;
							if( !$$.fso.FolderExists( path ) ) {
								throw new Error( 'Path "' + path + '" not found.' )
							}
							var fol = $$.fso.GetFolder( path ),
								folC = new Enumerator( fol.SubFolders ),
								tMS = new TestModeStack();
							
							for(; !folC.atEnd(); folC.moveNext() ) {
								var fItem = folC.item()
								,	compiler = this._getCompiler( fItem.Name )
								,	threadSafety = this._getThreadSafety( fItem.Name )
								;
								
								for( var k in this.simple ){
									// constants are always upper-case.
									if( k != k.toUpperCase() ) continue;
									
									// we're not building this kind now.
									if( !( bit & this[k] ) ) continue; 
									
									// the exe we need isn't in the build
									if( !$$.fso.FileExists( $$.fso.BuildPath( fItem.Path, this.objects[k].executableName ) ) ) continue; if( !( this.objects[k].compiler & compiler ) ) continue; // wrong compiler
									
									// wrong thread-safety-ness
									if( !( this.objects[k].threadSafety & threadSafety ) ) continue; 
									
									// wrong compiler
									if( !( this.objects[k].compiler & compiler ) ) continue; 
									
									// build a TestMode and append it to the stack.
									var d = [];
									if( !Object.isUndefined( desc ) ) d.push( desc );
									d.push( k.toLowerCase().replace(/[_ ]/g,'-') );
									d.push( PHP.getName( compiler ) );
									var tM = new this.objects[k].TestMode(
										d.join('-')
									,	fItem.Path
									);
									tMS.addItem( tM );
								}
							}
							return tMS;
						}
,	'_getCompiler':		function( 
							str
						) {
							match = ( str.match( /\bVC[0-9]\b/i ) || [] ).shift();
							if( !Object.isUndefined( PHP[match] ) ) {
								return PHP[match]
							}
							return 0;
						}
,	'_getThreadSafety':	function( 
							str
						) {
							if( /\bnts\b/i.test( str ) ) {
								return PHP.NTS;
							} else {
								return PHP.ZTS;
							}
						}
} ))();

/**
 * Extend the testMode base class to provide functionality for CLI-based test modes
 */
var TestModeCLI = Class.create( TestMode, {

	/**
	 * Setup function ensures that the TestMode is set up for running the script
	 * @return {Boolean} true == success; false == soft failure
	 * @throws {Error} describing any blocking error
	 */
	'setup':		function( 
						$super
					) {
						return $super();
					},
					
	/**
	 * Run the script and return its output.
	 * @return {String} output of executed script
	 * @throws {Error} describing any blocking error
	 */
	'runScript':	function( 
						scriptPath
					) {
						return this.getCLI( scriptPath );
					},
	
	/**
	 * Destroy function ensures that the TestMode is no longer set up for running the script
	 * @return {Boolean} true == success; false == soft failure
	 * @throws {Error} describing any blocking error
	 */
	'destroy':		function( 
						$super
					) {
						return $super();
					},
					
	/**
	 * Initialize a new object, call using new keyword: var t = new TestModeCLI( arg1, arg2 );
	 * @param {String} description - short description for use in log output. Should be unique.
	 * @param {String} phpExePath - path to the php executable we are to be testing
	 * @param {String} phpIni - path to a php ini file to load
	 * 
	 * @return {TestModeCLI} new instance of this.
	 */
	'initialize':	function( 
						description 
					,	phpExePath
					,	phpIni
					) {
						this.description = description;
						this.phpExePath = ( ( phpExePath.slice(-8) == '\\php.exe' ) ?
											phpExePath.slice( 0, -8 ) :
											phpExePath
										);
						//this.phpArgs = phpArgs;
						return this;
					},
	
	/**
	 * Get output of a script from its path (relative or absolute) using this mode's phpExe
	 * @param {String} pathToFile - path to php file
	 * 
	 * @return {String} - output of php script
	 * @throws {Error} describing any blocking error
	 */
	'getCLI':		function( 
						pathToFile
					) {
						// TODO: For now we'll assume ini is whatever is default
						var command = $$.fso.BuildPath( this.phpExePath, 'php.exe' ) +' '+pathToFile 
						var proc = $$.WSHShell.Exec(command);
						var returnString = '';
						var errString = '';
						while ( proc.Status == 0 || 
								!proc.StdOut.AtEndOfStream || 
								!proc.StdErr.AtEndOfStream 		) {
							if ( !proc.StdOut.AtEndOfStream )
								returnString += proc.StdOut.ReadAll();
							else if ( !proc.StdErr.AtEndOfStream )
								errString += proc.StdErr.ReadLine();
							$$.WScript.Sleep( 10 );
						}
						
				
						if(proc.ExitCode)
							throw new TestResultBork( ''+proc.ExitCode, returnString );
				
						
						return returnString;
					},
	'_applyIni':	function(
						ini
					) {
						var iniPath = $$.fso.BuildPath( this.phpExePath, 'php.ini' );
						if( $$.fso.FileExists( iniPath ) ) {
							$$.fso.DeleteFile( iniPath );
						}
						if( ini ){
							var iniFile = $$.fso.CreateTextFile( iniPath );
							iniFile.Write( ini );
							iniFile.Close();
						}
					},
	
	/**
	 * Get the base INI for this TestMode.
	 * 
	 * @returns {Array} ini configuration, one line per array key
	 */
	'_getIni':		function(
						$super
					) {
						return $super().concat([
							';BEGIN:TestModeCLI'	
						,	';END:TestModeCLI'
						]);
					}
});
/** End declaration of TestModeCLI class */
TMSB.registerConstant( 'cli-nts', PHP.VC6|PHP.VC9, PHP.NTS, 'php.exe', TestModeCLI );
TMSB.registerConstant( 'cli-zts', PHP.VC6|PHP.VC9, PHP.ZTS, 'php.exe', TestModeCLI );





/**
 * Extend the TestMode base class to provide functionality for HTTP-based test modes
 */
var TestModeHTTP = Class.create( TestMode, {

	/**
	 * Setup function ensures that the TestMode is set up for running the script
	 * 
	 * @return {Boolean} true == success; false == soft failure
	 * @throws {Error} describing any blocking error
	 */
	'setup':		function( 
						$super
					) {
						return $super();
					},
					
	/**
	 * Run the script and return its output.
	 * 
	 * @return {String} output of executed script
	 * @throws {Error} describing any blocking error
	 */
	'runScript':	function( 
						physicalPathToFile
					) {
						var includeScript = this.generateIncludeFile(
													physicalPathToFile
											);
						try {
							var ret = this.getHTTP( this.baseAddress + '/' + includeScript );
						} catch( ball ){
							throw ball;
						} finally {
							// always clean up the include script
							$$.fso.DeleteFile( $$.fso.BuildPath( this.docRoot, includeScript ), true );
						}
						return ret;
					},
	
	/**
	 * Destroy function ensures that the TestMode is no longer set up for running the script
	 * 
	 * @return {Boolean} true == success; false == soft failure
	 * @throws {Error} describing any blocking error
	 */
	'destroy':		function( 
						$super
					) {
						return $super();
					},
	
	/**
	 * Initialize a new object, call using new keyword: var t = new TestModeHTTP( arg1, arg2, arg3, arg4, arg5 );
	 * @param {String} phpExe - path to the php executable we are to be testing
	 * @param {String} phpIni - path to a php ini file to load
	 * 
	 * @return {TestModeHTTP} new instance of this.
	 */
	'initialize':	function( 
						description
					,	docRoot 
					,	baseAddress /* = 'http://127.0.0.1:80'*/
					) {
						this.description = description;
						this.docRoot = docRoot;
						this.baseAddress = baseAddress || 'http://127.0.0.1:80';
						return this;
					},
	
	/**
	 * Generate an include file to the script in question and return the *address* to this file
	 * @param {String} physicalPathToFile
	 * 
	 * @return {String} URL of file created using this mode's baseAddress
	 * @throws {Error} if file does not exist
	 */
	'generateIncludeFile':	function( 
								physicalPathToFile
							) { 
								physicalPathToFile = $$.fso.GetAbsolutePathName(physicalPathToFile);
								if( !$$.fso.FileExists( physicalPathToFile ) )
									throw new Error( 'Cannot generate include file when target does not exist:'+physicalPathToFile );
								var include = 'include.'+$$.fso.GetBaseName(physicalPathToFile)+'.php';
								var includeFilePath = $$.fso.BuildPath(
										this.docRoot,
										include
									);
								var includeFile = $$.fso.CreateTextFile(
									includeFilePath
								);
								
								includeFile.Write("<?php require('"+physicalPathToFile+"'); ?>");
								includeFile.Close();
								
								return include;
							},
	/**
	 * Get output of a script given only its address
	 * @param {String} scriptAddress
	 * 
	 * @return {String} result of script execution
	 * @throws {Error} if return code != 200
	 */
	'getHTTP':		function( 
						scriptAddress
					) {
						var transport = new ActiveXObject('MSXML2.XMLHTTP');
						// TODO: For now we'll assume GET with no params. If we want to flesh 
						// this out in the future, the following page seems to point in the
						// right direction:
						// http://www.openjs.com/articles/ajax_xmlhttp_using_post.php
						// var mode = ((typeof(data.post)!='undefined')?'POST':'GET');
						var mode = 'GET';
						var fullURL = scriptAddress;
						
						try {
							transport.open( mode, fullURL, false );
							transport.send();
						} catch (e) {
							throw new TestResultBork( 'Script could not be reached.' );
						}
						
						if( transport.Status != 200 )
							throw new TestResultBork( 
											'Server returned '+transport.Status
										,	transport.ResponseText
										);
							
						return transport.ResponseText;
					},
	
	/**
	 * Get the base INI for this TestMode.
	 * 
	 * @returns {Array} ini configuration, one line per array key
	 */
	'_getIni':		function(
						$super
					) {
						return $super().concat([
							';BEGIN:TestModeHTTP'
						,	'display_errors=0'
						,	'html_errors=0'
						,	';END:TestModeHTTP'
						]);
					}
});
/** End declaration of TestModeHTTP class */