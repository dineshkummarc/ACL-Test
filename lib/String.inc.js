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