var LOG = function( message, level ) {
	if( message === false)
		return message;
	if( level & config.output.stdout.level ) {
		WScript.StdOut.WriteLine( message );
	}
	if( level & config.output.file.level ) {
		LOG.getOutputFileStream().WriteLine( message );
	}
}
// Use js.js's Function.Extend (note the capital E) to add stuff
// to Log without creating a new object like prototype.js's Object.extend()
LOG.Extend({
	'registerConstant':	function( constantName, constantValue ){
							if(typeof(constantValue)!='undefined'){
								this[constantName] = parseInt( constantValue );
							} else {
								if( !(this.simple) )
									this.simple = {};
								var i = Object.keys(this.simple).length;
								this[constantName] = this.simple[constantName] = Math.pow( 2, i );
								this.VERBOSE = ( Math.pow( 2, ( i + 1 ) ) - 1 );
							}
							return this[constantName];
						},
	'getOutputFileStream': function(){
							if( LOG._outputFileStream ) return LOG._outputFileStream;
							var logPath = config.output.file.path.Format();
							if( !$$.fso.FileExists( logPath ) ) {
								if( !$$.fso.FolderExists( logDir = $$.fso.GetParentFolderName( logPath ) ) )
									try { mkdirRecursive( logDir ); } catch (e) { Assert.Fail('Could not create log directory: {0}', logDir )}
								LOG._outputFileStream = $$.fso.CreateTextFile( logPath );
							} else {
								LOG._outputFileStream = $$.fso.OpenTextFile( logPath, 8 );
							}
							return LOG._outputFileStream;
						}
});
LOG.NONE = 0;
LOG.registerConstant( 'DEBUG' );
LOG.registerConstant( 'IMPORTANT' );
