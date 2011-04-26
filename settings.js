config.set({
	'testBenchFactors': {
			'modes': 			testModeStack
		,	'contextsScripts': 	testContextLocal
		,	'contextsFiles': 	testContextLocal
		,	'cases': 			testCasesAll
		}
,	'log': '{$ScriptPath}logs\\'.Format() + ( new Date ).iso8601( )
,	'output': {
			'stdout':	{
					'level':	LOG.VERBOSE
								^LOG.IIS_CONFIGURE
								^LOG.INFLIGHT_PRERUN
					}
		,	'file' 	:	{
					'level':	LOG.VERBOSE 
								^LOG.PREFLIGHT_SUMMARY
								^LOG.IIS_CONFIGURE
								^LOG.INFLIGHT_PRERUN
				,	'path':	'{config.log}\\output.log'
			}
		}
,	'logs': [
			new LogHelper.Console( 	LOG.VERBOSE
									^LOG.IIS_CONFIGURE
									^LOG.INFLIGHT_PRERUN
			),
			new LogHelper.File( LOG.VERBOSE
									^LOG.PREFLIGHT_SUMMARY
									^LOG.IIS_CONFIGURE
									^LOG.INFLIGHT_PRERUN
								, '{config.log}\\output.log'
			),
			new LogHelper.Mail( LOG.COMPARE_RESULTS
							| LOG.PASSRATE
							| LOG.PASSRATE_BASELINE
							| LOG.POSTFLIGHT_SUMMARY
				, {
					to:'ostcphp@microsoft.com',
					subject:'PFTT Results'
				}
			)
		]
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

config.set('mail',{
	server:'MAIL.EXAMPLE.COM',
	from:'<YOU@EXAMPLE.COM>'
});
