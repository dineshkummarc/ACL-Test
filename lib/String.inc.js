/*
 * A collection of extensions on the native String object.
 */

/**
 * A non-destructive string padder. Returns the padded
 * string but does not modify the original.
 */
String.prototype.pad = function String_pad(
	width
,	padChar // = ' '
,	direction // = String.PAD_LEFT
) {
	if( this.length > width ) { return this + ''; }
	if( typeof( padChar ) == 'undefined' ) { padChar = ' '; }
	if( typeof( direction ) == 'undefined' ) { direction = String.PAD_LEFT; }
	switch( direction ) {
		case String.PAD_LEFT:
			return '' + ( new Array( width + 1 - this.length ).join( padChar ) ) + this;
		case String.PAD_RIGHT:
			return '' + this + ( new Array( width + 1 - this.length ).join( padChar ) ) ;
		case String.PAD_BOTH:
			return ( '' + this )
					.pad( ( Math.floor( ( width - this.length ) / 2 ) + this.length ), padChar, String.PAD_RIGHT )
					.pad( width, padChar, String.PAD_LEFT );
	}
};
String.PAD_LEFT = 1;
String.PAD_RIGHT = 2;
String.PAD_BOTH = 3;

/**
 * A non-destructive string trimmer
 */
String.prototype.trim = function String_trim( 
	direction /*=String.TRIM_BOTH*/ 
) {
	var str = '' + this;
	direction = direction || String.TRIM_BOTH;
	
	if( direction & String.TRIM_LEFT )
		str = str.replace(/^[\s]+/,'');
	if( direction & String.TRIM_RIGHT )
		str = str.replace(/[\s]+$/,'');
	return str;
}
String.prototype.rtrim = function String_rtrim(){
	return this.trim( String.TRIM_RIGHT );
}
String.prototype.ltrim = function String_ltrim(){
	return this.trim( String.TRIM_LEFT );
}

String.TRIM_LEFT =  0x01;
String.TRIM_RIGHT = 0x10;
String.TRIM_BOTH =  0x11;

/**
 * Non-destructively unquote a properly-quoted string. If a string begins and ends with a quote character, strip it and 
 * reduce the escape level of all other escaped quotes of the same type.
 */
String.prototype.unquote = function String_unquote(){
	// just return the string if the whole thing isn't quoted.
	if( !this.charAt(0).match(/['"]/)) return ( '' + this );// not quoted
	if( this.charAt(0) != this.charAt(this.length-1) ) return ( '' + this ) // f+l don't match, can't be properly quoted
	try {
		// Due to scoping restrictions, this is the fastest way I could think of to provide the
		// quote string to the anonymous function used by RegExp's replace. Instantiate an object with the quote string
		// so that the functions inside of it know what that quote string is. Messy, but it works.
		var quoteHelper = new (function(quoteChar){
			var quoter = quoteChar;
			this.replacer = function( sub, m1, offset, s ) {
				switch( m1 ){
					case '': 
						throw new Error('Last Quote is escaped! '+offset);
					case '\\':
					case quoter: 
						return m1;
					default: 
						return sub;
				}
			};
			this.pattern = /\\(.?)/g;
		})(this.charAt(0));
		
		return (this.slice(1,-1)).replace( quoteHelper.pattern, quoteHelper.replacer);
	} catch (e) {
		return ''+this;
	}
}

String.prototype.quote = function String_quote( quote /* ='"' */) {
	quote = quote||'"';
	var quoteHelper = new (function(quoteChar){
		var quoter = quoteChar;
		this.replacer = '\\$&'
		this.pattern = new RegExp('(\\\\|'+quoter+')','g');
	})(quote)
	return quote + (this.replace(quoteHelper.pattern,quoteHelper.replacer)) + quote;
}
