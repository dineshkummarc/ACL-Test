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
							try { LOG( 'Setting up TestMode[{0}]'.Format( testMode.describe() ), LOG.INFLIGHT_INFO );
								testMode.setup();
								
								// For each TestCase object
								var tCase = this.testCases.newPointer();
								while( testCase = this.testCases.getNext( tCase ) ) {
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
LOG.registerConstant('INFLIGHT_PRERUN');
LOG.registerConstant('INFLIGHT_RESULT');
LOG.registerConstant('INFLIGHT_SKIPREASON');
LOG.registerConstant('INFLIGHT_INFO');
LOG.registerConstant('POSTFLIGHT_SUMMARY');
LOG.registerConstant('POSTFLIGHT_ANALYSIS');

TestBench.Extend({
	'runOne': 	function TestBenchºrunOne(
					testMode,
					testCase,
					testContextA,
					testContextB
				) { 
					// list what we're working with:
					var args = $A(arguments)
					,	desc = ['[____]']
					;
					while( args.length ) desc.push( args.shift().describe() );
					LOG( desc.join(' '), LOG.INFLIGHT_PRERUN);
					
					try {
						// if the test is borked, don't bother running it.
						if( borkReasons = testCase.detectBork() ) 
							throw new TestResultBork( borkReasons );
							
						// if the test uses unsupported features, skip it.
						if( skipReasons = testCase.detectUnsupportedFeatures() )
							throw new TestResultSkip( testCase, skipReasons.join('\n') );
						
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
						
						try {
							// Copy all non-phpt files in the directory over to the script's cwd.
							// This is to support files with external dependencies.
							var toDir = '{$ScriptPath}temp'.Format()
							,	fromDir = $$.fso.GetParentFolderName( testCase.phptPath )
							;
							if( !folderExists( fromDir ) ) throw new Error( "PHPT parent directory is not accessible: " + fromDir );

							var f = $$.fso.GetFolder( fromDir );
							for(fC = new Enumerator( f.files ); !fC.atEnd(); fC.moveNext() ) {
								var tF = fC.item();
								if( tF.Name.match( /\.phpt$/i ) ) continue; // don't copy the phpt files
								copy(
									tF.Path,
									cleanupFiles[cleanupFiles.push('{0}\\{1}'.Format(toDir,tF.Name))-1]
								);
							}
							// call function on subdirs too.
							for(fS = new Enumerator( f.subFolders ); !fS.atEnd(); fS.moveNext() ) {
								tF = fS.item();
								if( tF.Name.match( /\.svn$/i ) ) continue; // don't descend into .svn directories
								xcopy(
									tF.Path,
									cleanupFiles[cleanupFiles.push('{0}\\{1}'.Format(toDir,tF.Name))-1]
								);
							}
						} catch (e) {
							e.message = ['Problem loading phpt supporting files:',e.message].join('\n');
							throw e;
						}
						
						if( testCase.getSection( 'SKIPIF' ) ){
							var currentSkipIf = testCase.saveSection( 'SKIPIF',
								'{$ScriptPath}\\temp'.Format(),
								'.skipif.php'
							);
							cleanupFiles.push( currentSkipIf );
							skipIfReturn = testMode.runScript( currentSkipIf );
							if( ( m = skipIfReturn.match( /^skip(ped)?\b(.*)/i ) ) ){
								throw new TestResultSkip( testCase, m[0] );
							}
						}
						
						var currentTestFile = testCase.saveSection( 'FILE',
								'{$ScriptPath}\\temp'.Format(),
								'.php'
							);
						cleanupFiles.push( currentTestFile );
						var startTime = ( new Date() ).getTime();
						testCase.attachResultString( testMode.runScript( currentTestFile ) );
						var cost = ( new Date() ).getTime() - startTime;
						if( testCase.testResult() ){
							throw new TestResultPass( testCase );
						}
						throw new TestResultFail( testCase, testCase.resultString );

					} catch ( e ) {
						if( e instanceof TestResult ){
							var testResult = e;
							if( !(testResult instanceof TestResultSkip) && !Object.isUndefined( cost ) )
								testResult.cost = cost;
							testResult.attachToFactors( $A(arguments).reverse() );
							if( testResult instanceof TestResultBork){
								testResult.attachTestCase( testCase );
							}
							testResult.save();
							LOG( testResult.oneLine(), LOG.INFLIGHT_RESULT );
							if( testResult instanceof TestResultSkip ) LOG( '       '+testResult.reason, LOG.INFLIGHT_SKIPREASON );
							if( config.debug && ( ( testResult instanceof TestResultBork ) || ( testResult instanceof TestResultFail ) ) ) {
								WL('Paused. Press enter key to continue. \nPress "N" to continue without further pauses.');var input = WScript.StdIn.ReadLine();
								if( /N/i.test(input) ) { config.debug = false; }
							}
						} else throw e;
					
					} finally {
						if( testCase.getSection( 'CLEAN' ) ){
							var currentClean = testCase.saveSection( 'CLEAN',
								'{$ScriptPath}\\temp'.Format(),
								'.clean.php'
							);
							cleanupFiles.push( currentClean );
							testMode.runScript( currentClean );
						}
						// If it's filesystem-related, TestContext.destroy()
						if( testCase.getOptions().filesystem ) {
							TestContext.destroy( setupContexts );
						}
						
						while( cleanupFiles && cleanupFiles.length ) { 
							var f = cleanupFiles.pop()
							try {
								erase( f );
							} catch (e) {
								WL( 'Could not erase "{0}"'.Format(f) );
							}
						}
						
						testMode.doDestroy( didSetupTestMode );
						testCase.reset();
					}
					
					return testResult;
				}
})