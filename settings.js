config.set({
	'testBenchFactors': {
			'modes': 			testModeStackCLI
		,	'contextsScripts': 	testContextLocal
		,	'contextsFiles': 	testContextLocal
		,	'cases': 			testCasesAll
		}
,	'log': '{$ScriptPath}logs\\'.Format() + ( new Date ).iso8601( )
,	'output': {
			'stdout':	{
					'level':	LOG.VERBOSE
								^LOG.IIS_CONFIGURE
					}
		,	'file' 	:	{
					'level':	LOG.VERBOSE 
								^LOG.PREFLIGHT_SUMMARY
								^LOG.IIS_CONFIGURE
				,	'path':	'{config.log}\\output.log'
			}
		}
,	'analysis': {
			'hideUninterestingResults': true
		,	'isInteresting': {
						'PASS':true
					,	'BORK':true
					,	'FAIL':true
					,	'SKIP':false
					}
		}
,	'results': {
			'pathTemplate':'{config.log}\\{testMode}\\{testContextScripts}\\{testContextFiles}'
		}
});