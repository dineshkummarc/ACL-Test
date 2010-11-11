/**
 * Run all current testCases in all context combinations, through all modes
 * @param {TestModeStack|TestMode} testModes
 * @param {TestContextStack|TestContext} scriptsContexts
 * @param {TestContextStack|TestContext} optional filesContexts
 * 								if not supplied, scriptsContexts is used.
 * @param {TestCaseStack|TestCase} testCases
 * 
 * 
 */
function runTests(testModes,scriptsContexts,filesContexts,testCases){
	if( folderExists( config.log ) && !folderIsEmpty( config.log ) ) {
		throw new Error('The log directory "' + config.log + '" exists. Move or rename it so new logs don\'t collide with old logs.');
	} else {
		mkdirRecursive( config.log );
	}
	// Work a little magic to make the optional middle parameter work properly 
	// and enforce the type restrictions in the doc block. If a single item is detected,
	// wrap it in the Stack object of appropriate type.
	var args = $A( arguments );
	// 0th argument
	if( args[0] instanceof TestModeStack )   testModes = args[0];
	else if( args[0] instanceof TestMode ) ( testModes = new TestModeStack ).addItem( args[0] );
	else throw new Error('arg[0] must be an instance of TestModeStack or TestMode');
	
	// 1st argument
	if( args[1] instanceof TestContextStack )   scriptsContexts = args[1];
	else if( args[1] instanceof TestContext ) ( scriptsContexts = new TestContextStack ).addItem( args[1] );
	else throw new Error('arg[1] must be an instance of TestContextStack or TestContext');

	// 2nd arg if 4 are supplied, 1st arg if 3 are supplied, hence [args.length-2]
	if( args[args.length-2] instanceof TestContextStack )   filesContexts = args[args.length-2];
	else if( args[args.length-2] instanceof TestContext ) ( filesContexts = new TestContextStack ).addItem( args[args.length-2] );
	else throw new Error('When ' + (args.length) + ' args are supplied, ' + 
							'arg[' + ( args.length - 2 ) + '] must be an instance of ' +
							'TestContextStack or TestContext');
	
	// the last arg
	if( args[args.length-1] instanceof TestCaseStack )   testCases = args[args.length-1];
	else if( args[args.length-1] instanceof TestCase ) ( testCases = new TestCaseStack ).addItem( args[args.length-1] );
	else throw new Error('When ' + (args.length) + ' args are supplied, ' + 
							'arg[' + ( args.length - 1 ) + '] must be an instance of ' +
							'TestCaseStack or TestCase');
	
	LOG('=======================================', 					LOG.PREFLIGHT_SUMMARY );
	LOG('test modes:              '+testModes.items.length, 		LOG.PREFLIGHT_SUMMARY );
	LOG('test contexts (scripts): '+scriptsContexts.items.length, 	LOG.PREFLIGHT_SUMMARY );
	LOG('test contexts (files):   '+filesContexts.items.length, 	LOG.PREFLIGHT_SUMMARY );
	LOG('test cases:              '+testCases.items.length, 		LOG.PREFLIGHT_SUMMARY );
	LOG('---------------------------------------', 					LOG.PREFLIGHT_SUMMARY );
	LOG('total test scenarios:    '+(	testModes.items.length * 
										scriptsContexts.items.length * 
										filesContexts.items.length * 
										testCases.items.length ), 	LOG.PREFLIGHT_SUMMARY );
	LOG('=======================================', 					LOG.PREFLIGHT_SUMMARY );
	LOG('', LOG.PREFLIGHT_SUMMARY );
	
	if( config.dryRun ) {
		LOG('Dry Run. Exiting.', LOG.PREFLIGHT_SUMMARY);
		return;
	}
	
	var allResults = new TestResultStack();
	// For each test mode in the supplied TestModeStack
	var tMode = testModes.newPointer();
	while( currentMode = testModes.getNext( tMode ) ){
		try {
		currentMode.setup();
		
		// For each context as the scripts location
		var tContextS = scriptsContexts.newPointer();
		while( scriptContext = scriptsContexts.getNext( tContextS ) ){
			
			// For each context as the files location
			var tContextF = filesContexts.newPointer();
			while( filesContext = filesContexts.getNext( tContextF ) ){
				
				
				// For each test case 
				var tCase = testCases.newPointer();
				while( currentTest = testCases.getNext( tCase ) ){
					testFactors = {
						'testMode': currentMode,
						'testContextScripts':scriptContext,
						'testContextFiles':filesContext,
						'testCase':currentTest
					};
					
					testResult = runTest( testFactors );
					testResult.attachToFactors( testFactors );
					
					LOG( testResult.oneLine() + ' ' + testResult.cost + 'ms' , LOG.INFLIGHT_RESULT );
					testResult.save();
					currentTest.reset();
					allResults.addItem(testResult);

				} // end loop of tests
			} // end loop of files locations
		} // end loop of scripts locations
		} finally {
			currentMode.destroy();
		}
	} // end loop of test modes
	
	LOG( allResults.summarize(), LOG.POSTFLIGHT_SUMMARY );
	//WL(allResults.summarize());
	
	var aPoint = testCases.newPointer();
	while( testCase = testCases.getNext( aPoint ) ){
		LOG( testCase.analyzeResults(), LOG.POSTFLIGHT_ANALYSIS );
	}
	
	//allResults.saveResultLists('{testMode}\\{testContextScripts}\\{testContextFiles}');
	
	
	return allResults;
}
LOG.registerConstant('PREFLIGHT_SUMMARY');
LOG.registerConstant('INFLIGHT_RESULT');
LOG.registerConstant('POSTFLIGHT_SUMMARY');
LOG.registerConstant('POSTFLIGHT_ANALYSIS');



/**
 * runTest runs a single test scenario.
 * 
 * The formatting of arguments for this function are a little different from the rest of the codebase.
 * Instead of taking one argument per required parameter, this function takes an object containing required
 * key:value pairs because our ACL permutation function can pass a single object as the first argument of its map
 * function, not un unknown length. 
 * 
 * @param {Object} testFactors - *MUST* contain these four items:
 * 		@subparam {TestMode} testFactors.testMode
 * 		@subparam {TestContext} testFactors.testContextScripts
 * 		@subparam {TestContext} testFactors.testContextFiles
 * 		@subparam {TestCase} testFactors.testCase
 * @param {AccessControlEntry} optional ace
 *
 * @return {TestResult}
 */
function runTest( testFactors, ace ){
	var testMode = testFactors.testMode,
		testContextScripts = testFactors.testContextScripts,
		testContextFiles = testFactors.testContextFiles,
		testCase = testFactors.testCase;
		
	var didSetup = testMode.doSetup()
	,	didApplyIni = testMode.doApplyIni( testCase.getSection('INI') )
	;
	testContextScripts.setupScriptsDir();
	testContextFiles.setupFilesDir( /*ace*/ );
	
	testCase.replaceConstants({
		'SCRIPTSDIR':	testContextScripts.getScriptsDir(),
		'FILESDIR': 	testContextFiles.getFilesDir()
	});
	
	// If our files context is ACL-compatible AND we have an ace, replace those constants too.
	/*if( ( testContextFiles instanceof TestContextACL ) && !Object.isUndefined( ace ) ){
		//testCase.replaceConstants(
		//	ace.generateConstants()
		//);
	}*/
	
	try {
		if( testCase.getSection( 'SKIPIF' ) ){
			var currentSkipIf = testCase.saveSection( 'SKIPIF',
				scriptContext.getScriptsDir(),
				'.skipif.php'
			);
			skipIfReturn = testMode.runScript( currentSkipIf );
			if( ( m = skipIfReturn.match( /^skip\b(.*)/i ) ) ){
				throw new TestResultSkip( m[1] );
			}
		}
		var currentTestFile = testCase.saveSection( 'FILE',
				scriptContext.getScriptsDir(),
				'.php'
			);
		var startTime = ( new Date() ).getTime();
		currentTestResult = testMode.runScript( currentTestFile );
		if( testCase.testResult( currentTestResult ) ){
			throw new TestResultPass();
		}
		throw new TestResultFail( testCase, currentTestResult );

	} catch ( e ) { 
		if( e instanceof TestResult ){
			var testResult = e;
			testResult.cost = ( new Date() ).getTime() - startTime;
			if( testResult instanceof TestResultBork){
				testResult.attachTestCase( testCase );
			}
		} else throw e;	
	} finally {

	// If we have an ace, attach it.
		if( !Object.isUndefined( /*ace*/ ) ){
			testResult.ace = ace;
		}
		
		testContextFiles.destroyFilesDir( /*ace*/ );
		testContextScripts.destroyScriptsDir();
		testMode.doDestroy( didSetup );
		testMode.doResetIni( didApplyIni );
	}
	return testResult;
}