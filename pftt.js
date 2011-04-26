/*===[Notes]=============================================================

  This tool is to assist in the setup and execution of filesystem-related
  tests of PHP. 

  It can be git-clone'd from the following address if you have the proper
  credentials:
  
  ssh://gitphp@git.ctac.nttest.microsoft.com/~/php-fs-test-tool.git

  Owner: 
    Ryan Biesemeyer (v-ryanbi@microsoft.com)

  Contributors: 
    Suman Madavapeddi (v-sumada@microsoft.com)
    Ryan Biesemeyer (v-ryanbi@microsoft.com
    Kris Craig (a-krcrai@microsoft.com)

  Script Libraries:
    js.js - Garrett Serrack (garretts@microsoft.com)


//======================================================================*/

// SETUP
    // Bootstrap scripting library js.js
    with( new ActiveXObject("Scripting.FileSystemObject")) 
      for (var each in paths = 
          (".;" + WScript.ScriptFullName.replace( /(.*\\)(.*)/g, "$1") + "\\lib\\ext;" + (new ActiveXObject("WScript.Shell").Environment("PROCESS")("PATH"))).split(";")
        ) 
        if (FileExists(js = BuildPath(paths[each], "js.js"))) 
            { eval(OpenTextFile(js, 1, false).ReadAll()); break }

	// Include prototype.js
	eval(include("{$ScriptPath}lib\\ext\\prototype.js"));
	
	// Include extensions to native objects
	eval(include("{$ScriptPath}lib\\Math.inc.js"));
	eval(include("{$ScriptPath}lib\\String.inc.js"));
	eval(include("{$ScriptPath}lib\\Object.inc.js"));
	eval(include("{$ScriptPath}lib\\Array.inc.js"));
	eval(include("{$ScriptPath}lib\\Date.inc.js"));
	eval(include("{$ScriptPath}lib\\Function.withRetry.inc.js"));
	
    // Include other libraries
    eval(include("{$ScriptPath}lib\\Config.inc.js"));
	eval(include("{$ScriptPath}lib\\ConstantNamespace.inc.js"));
	eval(include("{$ScriptPath}lib\\Stack.inc.js"));
	eval(include("{$ScriptPath}lib\\LOG.inc.js"));
	eval(include("{$ScriptPath}lib\\Mailer.inc.js"));
	eval(include("{$ScriptPath}lib\\TestBenchFactor.inc.js"));
	eval(include("{$ScriptPath}lib\\TestResult.inc.js"));
	eval(include("{$ScriptPath}lib\\TestResultSetInspector.inc.js"));
	eval(include("{$ScriptPath}lib\\TestContext.inc.js"));
	eval(include("{$ScriptPath}lib\\PhpConfig.inc.js"));
	eval(include("{$ScriptPath}lib\\TestMode.inc.js"));
	eval(include("{$ScriptPath}lib\\TestModeHTTP\\IIS.inc.js"));
	eval(include("{$ScriptPath}lib\\TestModeHTTP\\Apache.inc.js"));
	eval(include("{$ScriptPath}lib\\TestCase.inc.js"));
	eval(include("{$ScriptPath}lib\\TestExpect.inc.js"));
	eval(include('{$ScriptPath}\\lib\\TestBench.inc.js'));
	
	// Include config files
	eval(include("{$ScriptPath}config\\testModes.js"));
	eval(include("{$ScriptPath}config\\testContexts.js"));
	eval(include("{$ScriptPath}config\\testCases.js"));
    
    eval(include("{$ScriptPath}settings.js"));
    eval(tryInclude("{$ScriptPath}localSettings.js"));

    // Make sure we're in the console before proceeding
    Assert.IsConsole();
	//Assert.IsAdmin();


function WL(line) {
	WScript.Stdout.WriteLine(line);
	return line;
}

function runTestsFromConfig(){
	var testBench = new TestBench( config.testBenchFactors.cases, config.testBenchFactors.contextsFiles );
	return testBench.run( config.testBenchFactors.modes );
}

function defaultAction(){
    WScript.StdOUt.WriteLine([
    	'Attempting to run tests from current configuration:'
	]).join('\n')

	runTestsFromConfig();
}
try{
	if(WScript.Arguments.Length > 0)
	    $$.ExecCommandLine();
	else
		defaultAction();
} finally {
	LOG.closeAll();
}