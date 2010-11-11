if( Object.isUndefined( TestModeHTTP ) ) {
	eval( include( "{$ScriptPath}lib\\TestMode.inc.js" ) );
}

/**
 * Since IIS handles things differently per version, this is an intermediate class that
 * does version-detection and calls _[:verb:]IIS[:version:]() when setup() or destroy() are called.
 */
var TestModeIIS = Class.create( TestModeHTTP, {
	'initialize':function(
					$super
				,	description
				,	phpExePath
				,	docRoot
				,	baseAddress
				) {
					this.phpExePath = $$.fso.GetFolder( phpExePath ).Path + '\\';
					docRoot = docRoot || 'C:\\inetpub\\wwwroot\\'; 
					baseAddress = baseAddress || 'http://127.0.0.1/';
					return $super( description, docRoot, baseAddress );
				}
,	/**
	 * 
	 */
	'setup':	function(
					$super
				) {
					// Stop the server before making changes
					this._serverCtl('stop');
					
					// Different setup is needed for different versions of IIS.
					switch ( this._getServerVersion() ) {
						case 7:
							this._setupIIS7();
							break;
						case 6:
							this._setupIIS6();
							break;
						case 5:
							this._setupIIS5();
							break;
						default:
							throw new Error( "IIS version [" + v + "] is not supported." );
					}
					// start the server back up
					this._serverCtl('start');
					
					return $super();
				}
				
	/**
	 * 
	 */
,	'destroy':	function(
					$super
				) {
					// Stop the server
					this._serverCtl('stop');
					
					// Different setup is needed for different versions of IIS.
					switch ( this._getServerVersion() ) {
						case 7:
							this._destroyIIS7();
							break;
						case 6:
							this._destroyIIS6();
							break;
						case 5:
							this._destroyIIS5();
							break;
						default:
							throw new Error( "IIS version [" + this._getServerVersion() + "] is not supported." );
					}
					return $super();
				}
	/**
	 * Use the registry to figure out what version of IIS is installed.
	 */
,	'_getServerVersion':function(
						) { 
							if( Object.isUndefined( this._serverVersion ) ) {
								this._serverVersion = $$.WSHShell.RegRead(
									"HKLM\\Software\\Microsoft\\InetStp\\MajorVersion"
								);
							}
							return this._serverVersion;
						}
	/**
	 * Control the server
	 * @param {String} action start|stop|restart
	 * 
	 * @return {void}
	 */
,	'_serverCtl':	function(
						action
					) {
						switch (action) {
							case 'stop':
							case 'start':
								$$('net '+action+' w3svc');
								break;
							case 'restart':
								this._serverCtl('stop');
								this._serverCtl('start');
								break;
							default:
								throw new Error('Unknown verb "' + action + '" used in TestModeIIS::_serverCtl()');
						}
					}
	/**
	 * Pass the string arguments to appcmd.
	 * @param {String} str - what to pass to appcmd
	 */
,	'_appcmd':		function( 
						str
					) {
						LOG( str, LOG.IIS_CONFIGURE );
						return $$( '%WINDIR%\\System32\\inetsrv\\appcmd ' + str );
					}
	/**
	 * Apply the ini string
	 * @param {String} ini
	 * 
	 * @return {void}
	 */
,	'_applyIni':	function(
						ini
					) {
						var iniPath = $$.fso.BuildPath( this.phpExePath, 'php.ini' );
						if( $$.fso.FileExists( iniPath ) ) {
							$$.fso.DeleteFile( iniPath );
						}
						ini = this._getIni().concat( ini ? [ini] : [] );
						if( ini.length ){
							var iniFile = $$.fso.CreateTextFile( iniPath );
							iniFile.Write( ini.join('\r\n') );
							iniFile.Close();
						}
					}
	/**
	 * Apply the ini and restart if an ini was applied.
	 * @param {String} ini
	 * 
	 * @return {Boolean}
	 */
,	'doApplyIni':	function( 
						$super
					,	ini 
					) {
						if( $super( ini ) ) {
							this._serverCtl('restart');
							return true;
						}
						return false;
					}
	/**
	 * Reset the ini and restart if an ini was applied.
	 * @param {String} ini
	 * 
	 * @return {Boolean}
	 */
,	'doResetIni':	function( 
						$super
					,	didSetupIni 
					) {
						if( $super( didSetupIni ) ) {
							this._serverCtl('restart');
							return true;
						}
						return false;
					}
} );
LOG.registerConstant( 'IIS_CONFIGURE' );

TestModeIIS_FastCGI = Class.create( TestModeIIS, {
	/**
	 * Setup IIS 7 using this TestMode
	 * @return {void}
	 */
	'_setupIIS7':	function(
					) {
						// Set up the fastCGI module.
						this._appcmd( "set config /section:system.webServer/fastCGI " +
							"/+["+
								"fullPath='" + this.phpExePath + "php-cgi.exe'" +
								",arguments=''"+
							"]"
						);
						// add environment variables to the module we just created
						this._appcmd( "set config /section:system.webServer/fastCGI " +
							"/+["+
								"fullPath='" + this.phpExePath + "php-cgi.exe'" +
								",arguments=''"+
							"].environmentVariables.["+
								"name='PHPRC'"+
								",value='" + this.phpExePath + "'"+
							"]"
						);
						
						// Set up the fastCGI module as a handler for php files
						this._appcmd( "set config /section:system.webServer/handlers " +
							"/+[" +
								"name='PHP_via_FastCGI'"+
								",path='*.php'"+
								",verb='*'"+
								",modules='FastCgiModule'"+
								",scriptProcessor='" +this.phpExePath + "php-cgi.exe'" +
							"]"
						);
					}
	/**
	 * Setup IIS 6 using this TestMode
	 * @return {void}
	 */
, 	'_setupIIS6':	function(
					) {
						return this._setupIIS5();
					}
	/**
	 * Setup IIS 5 using this TestMode
	 * @return {void}
	 */
, 	'_setupIIS5':	function(
					) {
						this._fcgiconfig( '-add -section:"PHP" -extension:php -path:"' + this.phpExePath + 'php-cgi.exe"' );
						this._fcgiconfig( '-set -section:"PHP" -InstanceMaxRequests:10000' );
						this._fcgiconfig( '-set -section:"PHP" -EnvironmentVars:PHP_FCGI_MAX_REQUESTS:10000' );
						this._fcgiconfig( '-set -section:"PHP" -EnvironmentVars:PHPRC:"' + this.phpExePath + '"' );
					}
	/**
	 * Unsetup IIS 7 using this TestMode
	 * @return {void}
	 */
,	'_destroyIIS7':	function(
					) {
						this._serverCtl('stop');
						
						// Remove the fastCGI module.
						this._appcmd( "clear config /section:system.webServer/fastCGI" );
						
						// Remove the fastCGI module as a handler for php files
						this._appcmd( "set config /section:system.webServer/handlers " +
							"/-[" +
								"name='PHP_via_FastCGI'"+
							"]"
						);
						
					}
	/**
	 * Unsetup IIS 6 using this TestMode
	 * @return {void}
	 */
, 	'_destroyIIS6':	function(
					) {
						return this._destroyIIS5();
					}
	/**
	 * Unetup IIS 6 using this TestMode
	 * @return {void}
	 */
, 	'_destroyIIS5':	function(
					) {
						this._fcgiconfig( '-remove -section="PHP"' );
					}
	/**
	 * Pass the string arguments to fcgiconfig.
	 * @return {void}
	 */
,	'_fcgiconfig':	function( 
						str
					) {
						LOG( str, LOG.IIS_CONFIGURE );
						return $$( 'cscript %WINDIR%\\System32\\inetsrv\\fcgiconfig.js ' + str );
					}
	/**
	 * Apply the ini.
	 * @param {String} ini
	 * 
	 * @return {Boolean}
	 *//*
,	'_applyIni':	function(
						$super
					,	iniString
					) {
						return $super(
							iniString
						);
					}	*/
	/**
	 * Get the base INI for this TestMode.
	 * 
	 * @returns {Array} ini configuration, one line per array key
	 */
,	'_getIni':		function(
						$super
					) {
						return $super().concat([
							';BEGIN:TestModeIIS_FastCGI'
							,	'cgi.force_redirect=0'
							,	'cgi.rfc2616_headers=0'
						,	';END:TestModeIIS_FastCGI'
						]);
					}
} );
// Register iis_fastcgi constant
TMSB.registerConstant( 
	'iis_fastcgi'
,	PHP.VC6|PHP.VC9
,	PHP.NTS
,	'php-cgi.exe'
,	TestModeIIS_FastCGI
);
// Register iis_fastcgi_zts constant
TMSB.registerConstant( 
	'iis_fastcgi_zts'
,	PHP.VC6|PHP.VC9
,	PHP.ZTS
,	'php-cgi.exe'
,	TestModeIIS_FastCGI
);
