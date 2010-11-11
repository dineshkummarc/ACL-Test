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
	
    // Include other libraries
	eval(include("{$ScriptPath}lib\\Function.withRetry.inc.js"));
	eval(include("{$ScriptPath}lib\\ConstantNamespace.inc.js"));
	eval(include("{$ScriptPath}lib\\Stack.inc.js"));
	eval(include("{$ScriptPath}lib\\LOG.inc.js"));
	eval(include("{$ScriptPath}lib\\TestBenchFactor.inc.js"));
	eval(include("{$ScriptPath}lib\\TestResult.inc.js"));
	eval(include("{$ScriptPath}lib\\TestContext.inc.js"));
	eval(include("{$ScriptPath}lib\\TestMode.inc.js"));
	eval(include("{$ScriptPath}lib\\TestModeHTTP\\IIS.inc.js"));
	eval(include("{$ScriptPath}lib\\TestModeHTTP\\Apache.inc.js"));
	eval(include("{$ScriptPath}lib\\TestCase.inc.js"));
	eval(include("{$ScriptPath}lib\\runTests.inc.js"));
	
	WScript.StdOut.WriteLine($ScriptPath);
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


function setupFilesDir(pathToFilesDir){
	var addFileToDir = function(dir){
		var file = $$.fso.CreateTextFile(dir+'\\existing_file');
		file.WriteLine('Created by pftt');
		file.Close();
		
		/* Add a file with a .txt extension.  --Kris */
		file = $$.fso.CreateTextFile(dir+'\\existing_text_file.txt');
		file.WriteLine('Created by pftt');
		file.Close();
		
		/* Add a symlink to existing_file.  --Kris */
		createSymLink( dir + '\\existing_file' );
		
		/* Add a multi-line CSV file.  --Kris */
		file = $$.fso.CreateTextFile( dir + '\\existing_csv_file.csv' );
		file.WriteLine( 'a,b,c,d' );
		file.WriteLine( '1,1,1' );
		file.WriteLine( '2,2,2' );
		file.WriteLine( '3,3,3' );
		file.WriteLine( '4,4,4' );
		file.Close();
		
		/* Copy the contents of resources directory.  --Kris */
		xcopy( "{$ScriptPath}resources\\*", dir );
		
		return;
	};
	
	/*
	 * This function creates a symlink pointing to the target.
	 * The target name is parsed from the absolute path of the target, 
	 * allowing for a single argument to be supplied.  The symlink 
	 * will reside in the same path, named "symlink_to_(target-name)".
	 * 
	 * If the target is a directory, the "/D" option will automatically 
	 * be added as required by MKLINK.
	 * 
	 * --Kris
	 */
	var createSymLink = function ( target ) {
		var sTarget = $$.fso.BuildPath( 
			$$.fso.GetParentFolderName( target ),
			"symlink_to_" + $$.fso.GetFileName( target ) 
		);
		
		/* Autodetect directory targets.  --Kris */
		if ( $$.fso.FolderExists( target ) ) {
			$$( 'cmd /c MKLINK /D "{0}" "{1}"', sTarget, target );
		} else if ( $$.fso.FileExists( target ) ) {
			$$( 'cmd /c MKLINK "{0}" "{1}"', sTarget, target );
		} else {
			WL( 'File or Folder ' + target + ' not found!' );
		}
		
		return sTarget;
	}

	/*
	 * This function creates a junction pointing to the target.
	 * The target name is parsed from the absolute path of the target, 
	 * allowing for a single argument to be supplied.  The junction 
	 * will reside in the same path, named "j_to_(target-name)".
	 * 
	 * --Kris
	 */
	var createJunction = function ( target )
	{
		var jTarget = $$.fso.BuildPath( 
			$$.fso.GetParentFolderName( target ),
			"j_to_" + $$.fso.GetFileName( target ) 
		);
		
		$$( 'cmd /c MKLINK /J "{0}" "{1}"', jTarget, target );
		
		return jTarget;
	}
	
	if(!$$.fso.FolderExists(pathToFilesDir)) {
		WL(pathToFilesDir);
		mkdirRecursive(pathToFilesDir);
	}
	var childDir = $$.fso.CreateFolder(pathToFilesDir+'\\existing_folder');
	addFileToDir(childDir.Path);
	createJunction(childDir.Path);
	addFileToDir(pathToFilesDir);
	createSymLink( pathToFilesDir + "\\existing_folder" );
}


/**
 * Truncate the results folder. 
 */
function TruncateResults(){
    var resultsDir = "{$ScriptPath}results";
    truncateDir(resultsDir);
}

function truncateDir(dir){
	dir = dir.replace(/[\\\/]+$/,'');
    if($$.fso.FolderExists(dir)){
        $$( 'cmd /c rmdir {0} {1} "{2}"', '/s', '/q', dir );
	}
    $$.fso.CreateFolder(dir);
}

function runTestsFromConfig(){
		runTests(
			config.testBenchFactors.modes,
			config.testBenchFactors.contextsScripts,
			config.testBenchFactors.contextsFiles,
			config.testBenchFactors.cases
		);
}

function defaultAction(){
    WScript.StdOUt.WriteLine('This script does not actually /do/ anything unless you supply arguments. '+
    'In fact, it does not do much at all yet, since we are still figuring out how to co-write it. '+
    '');
}

if(WScript.Arguments.Length > 0)
    $$.ExecCommandLine();
else
	defaultAction();