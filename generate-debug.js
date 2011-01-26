// Parse the given file, recursively turning eval(include()) into an actual include. return the whole JS file as a string.

    // Bootstrap scripting library js.js
    with( new ActiveXObject("Scripting.FileSystemObject")) 
      for (var each in paths = 
          (".;" + WScript.ScriptFullName.replace( /(.*\\)(.*)/g, "$1") + "\\lib\\ext;" + (new ActiveXObject("WScript.Shell").Environment("PROCESS")("PATH"))).split(";")
        ) 
        if (FileExists(js = BuildPath(paths[each], "js.js"))) 
            { eval(OpenTextFile(js, 1, false).ReadAll()); break }

	// Include prototype.js
	eval(include("{$ScriptPath}lib\\ext\\prototype.js"));

// Set up some useful constants
var FOR_READING = 1
,	FOR_WRITING = 2
,	FOR_APPENDING = 8
;	

function IncludeFile( path ) {
	path = path.Format();
	var pathNice = getRelativePath( '{$ScriptPath}'.Format(), path )
	,	ret = []
	,	lineNumber = 0
	;
	ret.push('//#  INCLUDE: {0}'.Format( pathNice ) );
	try {
		var fileStream = $$.fso.openTextFile( path.Format(), FOR_READING )
	} catch ( e ) { Assert.Fail('Could\'nt load file: [{0}]', path.Format() ); }
	while( !fileStream.AtEndOfStream ) {
		lineNumber++;
		var line = fileStream.ReadLine();
		matches = line.match( /eval\(\s*include\(\s*(['"])(.*)\1\s*\)\s*\)\s*;?/ );
		if( matches ) {
			ret.push( IncludeFile( matches[2] ) );
			ret.push('//# CONTINUE: {0}@{1}'.Format( pathNice, ( lineNumber + 1 ) ) );
		} else {
			line = line.replace(/\t/g,'    ');
			ret.push( 
				line + 
				('// '+(''+lineNumber).pad(4)).pad(120-line.length) +
				' '+pathNice
			);
		}
	}
	
	return ret.join('\n');
}

var header = '/'+'**'+['',
	'Generated {0}'.Format( (new Date()).getTime() )
,	'This is a READ-ONLY file to help debug output in JScript implementation.'
,	''
,	'Because JScript does not support #include and it is impossible to incluse'
,	'scripts into the current scope, workarounds depend on eval() but that '
,	'breaks error reporting, since the interpreter isn\'t aware of the line '
,	'numbers of code that is eval()\'d. The included pftt-debug.bat script '
,	'pre-compiles everything into a single file (this file), which can be used'
,	'to look up the line number and filename of the offending code.'
,	''
,	'USAGE: '
,	'  >pftt-debug runTestsFromConfig();'
,	''
].join('\r\n * ') + '\r\n *'+'/';

$$.fso.createTextFile( '{$ScriptPath}.pftt-debug.js'.Format(), true )
	.Write( header + '\r\n' + 
		IncludeFile('{$ScriptPath}pftt.js')
	);
