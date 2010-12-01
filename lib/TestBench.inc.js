var TestBench = Class.create({
	'initialize': 	function TestBenchºinitialize(
						testCases
					,	testContextsA /* =testContextLocal */
					,	testContextsB /* =testContextA */
					) {
						this.testCases = ( 
							testCases instanceof TestCaseStack ? 
								testCases : 
							testCases instanceof TestCase ? 
								( new TestCaseStack ).addItem( testCases ) : 
							Assert.Fail('TestBench must have at least one TestCase.')
						);
						this.testContextsA = ( 
							testContextsA instanceof TestContextStack ? 
								testContextsA : 
							testContextsA instanceof TestContext ? 
								( new TestContextStack ).addItem( testContextsA ) : 
							false
						);
						this.testContextsB = ( 
							( Object.isUndefined( testContextsB ) ) ? 
								this.testContextsA : // If not defined, use A
							( testContextsB instanceof TestContextStack ) ?
								testContextsB : 
							( testContextsB instanceof TestContext ) ? 
								( new TestContextStack ).addItem( testContextB ) : 
							false
						);
						
					},
	'run':			function TestBenchºrun( testModeOrTestModeStack ) {
						// Ensure that the argument supplied is or can be built into a TestModeStack object.
						var testModes = (
							//( testModeOrTestModeStack instanceof TestModeStackBuilder ) ? 
							//	TestModeStackBuilder.build() :
							( testModeOrTestModeStack instanceof TestMode ) ? 
								( new TestModeStack ).addItem( testModeOrTestModeStack ) :
							( testModeOrTestModeStack instanceof TestModeStack ) ? 
								( testModeOrTestModeStack ) :
							Assert.Fail( 'Argument must be instance of TestModeStackBuilder, TestMode, or TestModeStack.' )
						);
						
						LOG('=======================================', 					LOG.PREFLIGHT_SUMMARY );
						LOG('test modes:           '+testModes.items.length, 			LOG.PREFLIGHT_SUMMARY );
						LOG('test cases:           '+this.testCases.items.length, 		LOG.PREFLIGHT_SUMMARY );
						if( this.testContextsA )
						LOG('test contexts A:      '+this.testContextsA.items.length, 	LOG.PREFLIGHT_SUMMARY );
						
						if( this.testContextsB )
						LOG('test contexts B:      '+this.testContextsB.items.length, 	LOG.PREFLIGHT_SUMMARY );
						
						LOG('---------------------------------------', 					LOG.PREFLIGHT_SUMMARY );
						LOG('total test scenarios: '+(	testModes.items.length * 
														this.testCases.items.length * 
														( this.testContextsA.items.length || 1 )* 
														( this.testContextsB.items.length || 1 ) 
																				), 		LOG.PREFLIGHT_SUMMARY );
						LOG('=======================================', 					LOG.PREFLIGHT_SUMMARY );
						LOG('', LOG.PREFLIGHT_SUMMARY );
						
						/*if( config.dryRun ) {
							LOG('Dry Run. Exiting.', LOG.IMPORTANT);
							return;
						}/**/			
						
						
						var allResults = new TestResultStack();
						// For each TestMode object in the supplied stack
						var tMode = testModes.newPointer();
						while( testMode = testModes.getNext( tMode ) ) { 
							try { //WL(testMode.describe());
								testMode.setup();
								
								// For each TestCase object
								var tCase = this.testCases.newPointer();
								while( testCase = this.testCases.getNext( tCase ) ) { //WL('\t'+testCase.describe());
									if( testCase.getOptions().filesystem ) {
										// Iterate over testContextsA
										tContextA = this.testContextsA.newPointer();
										while( testContextA = this.testContextsA.getNext( tContextA ) ) { 
											if( !testCase.getOptions().link ) {
												allResults.addItem( TestBench.runOne( testMode, testCase, testContextA ) );
											} else {
												// Iterate over testContextsB
												tContextB = this.testContextsB.newPointer();
												while( testContextB = this.testContextsB.getNext( tContextB ) ) { 
													allResults.addItem( TestBench.runOne( testMode, testCase, testContextA, testContextB ) );
												} // End TestContextB loop.
											}
										} // End TestContextA loop.
									} else { // non-filesystem
										allResults.addItem( TestBench.runOne( testMode, testCase ) );
									}
								} // end TestCase loop
								
							} finally {
								testMode.destroy();
							}
						} // end TestMode loop
						
						
						LOG( allResults.summarize(), LOG.POSTFLIGHT_SUMMARY );
						
						LOG( sep1=(new Array(20).join('=') ), LOG.POSTFLIGHT_ANALYSIS );
						LOG( 'Analysis by TestCase:', LOG.POSTFLIGHT_ANALYSIS );
						LOG( sep2=(new Array(20).join('-') ), LOG.POSTFLIGHT_ANALYSIS );
						var aPoint = this.testCases.newPointer();
						while( testCase = this.testCases.getNext( aPoint ) ){
							LOG( testCase.analyzeResults(), LOG.POSTFLIGHT_ANALYSIS );
						}
						LOG( sep2, LOG.POSTFLIGHT_ANALYSIS );
						LOG( sep1, LOG.POSTFLIGHT_ANALYSIS );
						LOG( 'Analysis by TestMode:', LOG.POSTFLIGHT_ANALYSIS );
						var bPoint = testModes.newPointer();
						while( testMode = testModes.getNext( bPoint ) ){
							LOG( testMode.analyzeResults(), LOG.POSTFLIGHT_ANALYSIS );
						}
						LOG( sep2, LOG.POSTFLIGHT_ANALYSIS );
						
						return allResults;
					}
});
LOG.registerConstant('PREFLIGHT_SUMMARY');
LOG.registerConstant('INFLIGHT_RESULT');
LOG.registerConstant('POSTFLIGHT_SUMMARY');
LOG.registerConstant('POSTFLIGHT_ANALYSIS');

TestBench.Extend({
	'runOne': 	function TestBenchºrunOne(
					testMode,
					testCase,
					testContextA,
					testContextB
				) { 
					try {
						if( config.dryRun ){ throw new TestResultSkip( testCase, 'Dry Run'); }
						var didSetupTestMode = testMode.doSetup()
						,	didApplyIni = testMode.doApplyIni( testCase.getSection('INI') )
						,	cleanupFiles = []
						;
						
						// If it's filesystem-related, TestContext.setup()
						if( testCase.getOptions().filesystem ) { 
							var setupContexts = TestContext.setup( testCase.getOptions(), testContextA, testContextB );
							
							// Replace the appropriate ___CONSTANTS___
							for( var key in setupContexts ) {
								var replaceConstantsObj = {};
									replaceConstantsObj['CONTEXT_'+key.toUpperCase()] = setupContexts[key].getDir( key );
									// FILESDIR For backwards-compat. Deprecated. 
									// @TODO: Rewrite TestCase files to use CONTEXT_A instead.
									replaceConstantsObj['FILESDIR'] = setupContexts[key].getDir( key );
									
								testCase.replaceConstants( replaceConstantsObj );
							}
							
						}
						
						if( testCase.getSection( 'SKIPIF' ) ){
							var currentSkipIf = testCase.saveSection( 'SKIPIF',
								'{$ScriptPath}\\temp'.Format(),
								'.skipif.php'
							);
							cleanupFiles.push( currentSkipIf );
							skipIfReturn = testMode.runScript( currentSkipIf );
							if( ( m = skipIfReturn.match( /^skip(ped)?\b(.*)/i ) ) ){
								throw new TestResultSkip( testCase, m[2] );
							}
						}
						var currentTestFile = testCase.saveSection( 'FILE',
								'{$ScriptPath}\\temp'.Format(),
								'.php'
							);
						cleanupFiles.push( currentTestFile );
						var startTime = ( new Date() ).getTime();
						currentTestResult = testMode.runScript( currentTestFile );
						if( testCase.testResult( currentTestResult ) ){
							throw new TestResultPass( testCase );
						}
						throw new TestResultFail( testCase, currentTestResult );

					} catch ( e ) {
						if( e instanceof TestResult ){
							var testResult = e;
							if( !(testResult instanceof TestResultSkip) )
								testResult.cost = ( new Date() ).getTime() - startTime;
							testResult.attachToFactors( $A(arguments).reverse() );
							if( testResult instanceof TestResultBork){
								testResult.attachTestCase( testCase );
							}
							testResult.save()
							LOG( testResult.oneLine(), LOG.INFLIGHT_RESULT );
							if( config.debug && ( ( testResult instanceof TestResultBork ) || ( testResult instanceof TestResultFail ) ) ) {
								WL('Paused. Press enter key to continue...');WScript.StdIn.ReadLine();
							}
						} else throw e;
					
					} finally {
						// If it's filesystem-related, TestContext.destroy()
						if( testCase.getOptions().filesystem ) {
							TestContext.destroy( setupContexts );
						}
						
						while( cleanupFiles && cleanupFiles.length ) { erase( cleanupFiles.pop() ); }
						
						testMode.doDestroy( didSetupTestMode );
						testMode.doResetIni( didApplyIni );
						testCase.reset();
					}
					
					return testResult;
				}
})