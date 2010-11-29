var LOG = function( message, level ) {
	if( message === false)
		return message;
	if( level & config.output.stdout.level ) {
		WScript.StdOut.WriteLine( message );
	}
	if( level & config.output.file.level ) {
		var logPath = config.output.file.path.Format();
		if( !$$.fso.FileExists( logPath ) ) {
			var stream = $$.fso.CreateTextFile( logPath );
		} else {
			var stream = $$.fso.OpenTextFile( logPath, 8 );
		}
		stream.WriteLine( message );
		stream.Close();
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
						}
});
LOG.NONE = 0;
LOG.registerConstant( 'DEBUG' );
LOG.registerConstant( 'IMPORTANT' );
