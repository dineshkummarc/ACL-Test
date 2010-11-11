if( Object.isUndefined( TestModeHTTP ) ) {
	eval( include( "{$ScriptPath}lib\\TestMode.inc.js" ) );
}

/**
 * 
 * 
 */
var TestModeApache = Class.create( TestModeHTTP, {
	/**
	 * Mangle TestModeHTTP's init function to work properly in automation.
	 * @param {String} description - no spaces, please
	 * @param {String} PHPBuildPath - path to php build directory
	 * @param {String} docRoot optional default config.Apache2 + 'htdocs'
	 * @param {String} baseAddress - default http://127.0.0.1/
	 */
	'initialize':function(
					$super
				,	description
				,	PHPBuildPath
				,	docRoot
				,	baseAddress
				) { 
					this.PHPBuildPath = PHPBuildPath;
					this.apacheRoot = 'C:\\Apache22\\';
					this.apachectl = $$.fso.BuildPath( this.apacheRoot, 'bin\\httpd' );
					
					// Back up the httpd.conf if it isn't backed up already.
					if( !$$.fso.FileExists( $$.fso.BuildPath( this.apacheRoot, 'conf\\httpd.original.conf') ) ) {
						$$.fso.CopyFile(
							$$.fso.BuildPath( this.apacheRoot, 'conf\\httpd.conf'),
							$$.fso.BuildPath( this.apacheRoot, 'conf\\httpd.original.conf')
						);
					}
					return $super( 
						description
					,	docRoot || $$.fso.BuildPath( this.apacheRoot, 'htdocs' )
					,	baseAddress || 'http://127.0.0.1/'
					);
				}
	/**
	 * Setup this TestMode in Apache and start the server.
	 * @return {void}
	 */
,	'setup':	function(
					$super
				) {
					this._serverCtl('install');
					this._applyIni( false, true );
					var conf = $$.fso.OpenTextFile( 
						$$.fso.BuildPath( this.apacheRoot, 'conf\\httpd.conf')
					,	8 // FOR_APPENDING 
					);
					conf.WriteLine( this._getConfiguration() );
					conf.Close();
					
					this._serverCtl('start');
					return $super()
				}
	/**
	 * Un-setup this TestMode in Apache.
	 * @return {void}
	 */
,	'destroy':	function(
					$super
				) {
					this._serverCtl('stop');
					
					$$.fso.CopyFile(
							$$.fso.BuildPath( this.apacheRoot, 'conf\\httpd.original.conf'),
							$$.fso.BuildPath( this.apacheRoot, 'conf\\httpd.conf'),
							true // overwrite
						);
					this._serverCtl('uninstall');
					return $super()
				}
	/**
	 * control Apache.
	 * The method to this method is madness, but it is entirely justified. WshShell.Exec() fails
	 * to close if there is StdErr and no StdOut, even if you don't try to read from either. 
	 * @param {String} verb start|stop|shutdown|restart|install|uninstall
	 * 
	 * @return {String} stdout of command
	 */
,	'_serverCtl':function(
					verb
				) {
					switch( verb ) {
						// net seems to be faster at handling the service once it's installed.
						case 'start':
						case 'stop':
							$$( 'net '+verb+' pftt-apache');
							break;
						case 'restart':
							// net doesn't have a 'restart' function.
							this._serverCtl('stop');
							this._serverCtl('start');
							break;
						
						// this one is the trouble.
						// Calling `httpd -k install` pushes all output to stderr, and the resulting WshShellExec.Status never
						// flips to 1 (process complete) and oddly enough doesn't finish installing, no matter how long 
						// you give it. But, if you call `httpd -k install -v`, version information is sent to stdout, 
						// so the process closes and the service is installed correctly. The only problem is that the '-v' 
						// part gets saved in the service definition somehow, so it will refuse to start. Remedy that by calling 
						// `httpd -k config` which fails to close but succeeds at its task of clearing up the config.
						case 'install':
							this._serverCtl('install -v');
							this._serverCtl('config');
							break;
						
						// let httpd.exe handle these
						case 'uninstall':
						case 'install -v':
						case 'config':
							// 
							// Wrap in sub-shell and silence the STDERR because it won't return otherwise.
							var proc = $$.WSHShell.Exec(this.apachectl + ' -k ' + verb +' -n pftt-apache'/**/);
							var i=0;
							while( proc.Status == 0 && i < 100 ){
								i++;
								$$.WScript.Sleep(10);
							}
							return proc.Status;
							
							break;
							
						// Verb not defined.
						case 'default':
							throw new Error( 'Verb "'+verb+'" is not defined for TestModeApache::_serverCtl().' );
					}
				},
	/**
	 * Apply the given ini.
	 * @param {String} ini
	 *
	 * @return {void}
	 */
	'_applyIni':	function(
						ini
					) { 
						var iniPath = $$.fso.BuildPath( this.PHPBuildPath, 'php.ini' );
						if( $$.fso.FileExists( iniPath ) ) {
							$$.fso.DeleteFile( iniPath );
						}
						ini = this._getIni().concat( ini ? [ini] : [] );
						if( ini.length ){
							var iniFile = $$.fso.CreateTextFile( iniPath );
							iniFile.Write( ini.join('\r\n') );
							iniFile.Close();
						}
					},
	/**
	 * Apply the ini and restart if an ini was applied.
	 * @param {String} ini
	 * 
	 * @return {Boolean}
	 */
	'doApplyIni':	function( 
						$super
					,	ini 
					) {
						if( $super( ini ) ) {
							this._serverCtl('restart');
							return true;
						}
						return false;
					},
	/**
	 * Reset the ini and restart if an ini was applied.
	 * @param {String} ini
	 * 
	 * @return {Boolean}
	 */
	'doResetIni':	function( 
						$super
					,	didSetupIni 
					) {
						if( $super( didSetupIni ) ) {
							this._serverCtl('restart');
							return true;
						}
						return false;
					}
});






var TestModeApache_ModPHP = Class.create( TestModeApache, {
	/**
	 * get Configuration string: called by setup()
	 * @return {String}
	 */
	'_getConfiguration':function(
				) {
					var conf = [];
					conf.push('#BEGIN:PFTT-AUTOMATION#');
					conf.push('LoadModule php5_module "'+ $$.fso.BuildPath( this.PHPBuildPath, 'php5apache2_2.dll' ) +'"');
					conf.push('AddType application/x-httpd-php .php');
					conf.push('PHPIniDir "'+ this.PHPBuildPath +'"');
					conf.push('#END:PFTT-AUTOMATION#');
					
					return conf.join('\r\n');
				}
});
// Register TMSB constant
TMSB.registerConstant( 
	'apache_modphp'
,	PHP.VC9
,	PHP.ZTS
,	'php5apache2_2.dll'
,	TestModeApache_ModPHP
);