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
							false
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
						
						LOG( allResults.summarize() );
						
						return allResults;
					}
});

TestBench.Extend({
	'runOne': 	function TestBenchºrunOne(
					testMode,
					testCase,
					testContextA,
					testContextB
				) { 
					try {
						var didSetupTestMode = testMode.doSetup()
						,	didApplyIni = testMode.doApplyIni( testCase.getSection('INI') )
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
							skipIfReturn = testMode.runScript( currentSkipIf );
							if( ( m = skipIfReturn.match( /^skip(ped)?\b(.*)/i ) ) ){
								throw new TestResultSkip( testCase, m[2] );
							}
						}
						var currentTestFile = testCase.saveSection( 'FILE',
								'{$ScriptPath}\\temp'.Format(),
								'.php'
							);
						var startTime = ( new Date() ).getTime();
						currentTestResult = testMode.runScript( currentTestFile );
						if( testCase.testResult( currentTestResult ) ){
							throw new TestResultPass( testCase );
						}
						throw new TestResultFail( testCase, currentTestResult );

					} catch ( e ) {
						if( e instanceof TestResult ){
							var testResult = e;
							testResult.cost = ( new Date() ).getTime() - startTime;
							testResult.attachToFactors( $A(arguments).reverse() );
							if( testResult instanceof TestResultBork){
								testResult.attachTestCase( testCase );
							}
							testResult.save()
						} else throw e;
					
					} finally {
						// If it's filesystem-related, TestContext.destroy()
						if( testCase.getOptions().filesystem ) {
							TestContext.destroy( setupContexts );
						}
						
						testMode.doDestroy( didSetupTestMode );
						testMode.doResetIni( didApplyIni );
						testCase.reset();
					}
					LOG( testResult.oneLine(), LOG.INFLIGHT_RESULT );
					return testResult;
				}
})