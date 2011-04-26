var TestExpect = Class.create( {
	
		/**
		 * Initialize, set up.
		 * @param {String} expect
		 * @param {String} result
		 */
		'initialize':	function initialize( 
				expectStr
			,	resultStr
		) {
			this._expect = expectStr.trim().split(/(\n|\r\n)+/);
			this._result = resultStr.trim().split(/(\n|\r\n)+/);
		},
		
		/**
		 * Convert the diff to a readable diff string.
		 * 
		 * @return {String}
		 */
		'toString':function toString() {
			var r = []
			,	d = this.getDiff()
			;
			for( i = 0; i < d.length; i++) {
				switch( d[i][0] ) {
					case this.INSERT:
						r.push( '+|' + d[i][1] );
						break;
					case this.DELETE:
						r.push( '-|' + d[i][1] );
						break;
					case this.EQUALS:
						r.push( ' |' + d[i][1] );
						break;
				}
			}
			return r.join('\n');
		},
		
		/**
		 * Test whether or not the two inputs are equivalent
		 * 
		 * @return {Boolean}
		 */
		'isPass':function isPass() {
			if( this._pass != null ) return this._pass;
			var d = this.getDiff()
			;
			for( i = 0; i < d.length; i++ ) { 
				if( d[i][0] != this.EQUALS ) return ( pass = false );
			}
			return ( this._pass = true );
		},
		
		'getDiff':function getDiff(){
			if( !Object.isUndefined(this._diff) ) return this._diff;
			
			var A = this._expect.slice(0)
			,	B = this._result.slice(0)
			;
			
			this._diff = this._getDiff( A, B );
			
			// Clean up. We don't need these any more.
			delete this['_expect'];
			delete this['_result'];
			
			return this._diff;
		},
		
		/**
		 * Outermost differ. called by toString, isPass, and cached.
		 * @private
		 * 
		 * @return {@see this._diff}
		 */
		'_getDiff': function _getDiff( A, B ) {
			// Eliminate common prefixes...
			var prefix = this._commonPrefix( A, B );
			if( prefix.length ) {
				A.splice( 0, prefix.length );
				B.splice( 0, prefix.length );
			}
			
			// ...and suffixes. we'll add them back on at the end.
			var suffix = this._commonPrefix( A.slice(0).reverse(), B.slice(0).reverse() ).reverse()
			if( suffix.length ) { 
				A.splice( ( A.length - suffix.length ), suffix.length );
				B.splice( ( B.length - suffix.length ), suffix.length );
			}
			
			// wrap the output of _diff in any prefix or suffix we split off earlier.
			return [].concat(
					this._tokenize( prefix, this.EQUALS )
				,	this._diffEngine( A, B )
				,	this._tokenize( suffix, this.EQUALS )
			);
		},
		
		/**
		 * Weed out the easy inexpensive stuff, pass to _diffSlow as a last resort
		 * @private
		 * @param {Array} A
		 * @param {Array} B
		 * 
		 * @return {@see this._tokenize()}
		 */
		'_diffEngine':function _diffEngine( A, B ) {
			var ret = [];
			
			// If there's no A, we're just inserting B
			if( !A.length ) {
				return this._tokenize( B, this.INSERT );
			}
			// If there's no B, we're just inserting A
			if( !B.length ) {
				return this._tokenize( A, this.DELETE );
			}
			
			//- note: we don't abstract these, becase _compareLines needs items
			//- in a specific order. Abstracting might make the code 3-4 lines
			//- shorter, but at a cost of unreadable complexity.
			// if A is in B, [Bpre-insert][B-equals][Bpost-insert]
			if( A.length < B.length ){
				AinB: for( h = 0; h < ( B.length - A.length ); h++ ){
					for( n = 0; n < A.length; n++ ){
						if( !this._compareLines( A[n], B[ h+n ] ) ) continue AinB;
					}
					return [].concat(
							this._tokenize( B.slice( 0, h ), this.INSERT )
						,	this._tokenize( B, this.EQUALS )
						,	this._tokenize( B.slice( 0 + h + A.length ), this.INSERT )
					);
				}
			}
			// if B is in A, [Apre-delete][B-equals][Apost-delete]
			if( B.length < A.length ){
				BinA: for( h = 0; h < ( A.length - B.length ); h++ ){
					for( n = 0; n < B.length; n++ ){
						if( !this._compareLines( A[ h+n ], B[n] ) ) continue BinA;
					}
					return [].concat(
							this._tokenize( A.slice( 0, h ), this.DELETE )
						,	this._tokenize( B, this.EQUALS )
						,	this._tokenize( A.slice( 0 + h + B.length ), this.DELETE )
					);
				}
			}
			
			// If it's short enough to handle using LCS, do it.
			if( ( A.length + B.length ) < 200 ) { 
				return this._getDiffUsingLCS( A, B );
			// otherwise, split it into something managable plus a remainder.
			} else if( ( A.length > 40 ) && ( B.length > 40 ) ) {
				return this._reduceNoise(
					[].concat(
						this._getDiff( A.slice( 0, 40 ), B.slice( 0, 40 ) ),
						this._getDiff( A.slice( 40 ), B.slice( 40 ) )
					)
				);
			}
			// map::reduce failed us, resort to less informative but still technically correct diff.
			return [].concat( 
				this._tokenize( A, this.DELETE ),
				this._tokenize( B, this.INSERT ) 
			);
			
		},
		
		/**
		 * Solve the Longest Common Subsequence problem, and use the results to generate
		 * a tokenized diff.
		 * 
		 * Problem and working example here:
		 * http://en.wikipedia.org/wiki/Longest_common_subsequence_problem#LCS_function_defined
		 * Code written from scratch, without the use of examples also on the listed page.
		 */
		_getDiffUsingLCS: function TestExpect__getDiffUsingLCS( A, B ) {
			// PART 1: Build up matrices of LCS length and matchiness
			var LCSLEN = []
			,	COMMON = []
			;
			for( var a = 0; a <= A.length; a++ ) LCSLEN[a]= new Array( B.length + 1 );
			// pre-populate first row and column of LCSLEN with zeroes
			for( var a = 0; a <= A.length; a++ ) { LCSLEN[a][0] = 0; }
			for( var b = 0; b <= B.length; b++ ) { LCSLEN[0][b] = 0; }
			
			// first row and col will be null, but that helps everything else line up
			for( var a = 0; a <= A.length; a++ ) COMMON[a]= new Array( B.length +1 );
			
			for( var a = 1; a <= A.length; a++ ) {
				for( var b = 1; b <= B.length; b++ ) {
					COMMON[a][b] = this._compareLines( A[a-1], B[b-1] );
					if( COMMON[a][b] ) { // if it is a match, its lcs score is one greater than the cell up-left
						LCSLEN[a][b] = LCSLEN[a-1][b-1] + 1;
					} else { // if it is not a match, its lcs score is the greater of either up or left
						LCSLEN[a][b] = Math.max( LCSLEN[a][b-1] , LCSLEN[a-1][b]);
					}
				}
			}
			//now we have: LCSLEN, COMMON, A, B;

			// PART 2: reduce our knowns into a diff.
			return ( function reduceToDiff( a, b ) {
				// return equals token on top of diff with cursor advanced up-left
				if( a>0 && b>0 && COMMON[a][b] )
					return reduceToDiff( a-1, b-1 ).concat( [ [ 0, B[b-1] ] ] );
				
				// return insert token on top of diff with cursor advanced left
				if( b > 0 && ( a==0 || LCSLEN[a][b-1] >= LCSLEN[a-1][b] ) )
					return reduceToDiff( a, b-1 ).concat( [ [ 1, B[b-1] ] ] );
				
				// return delete token on top of diff with cursor advanced up
				if( a > 0 && ( b==0 || LCSLEN[a][b-1] < LCSLEN[a-1][b] ) )
					return reduceToDiff( a-1, b ).concat( [ [ -1, A[a-1] ] ] );
				
				// return empty token set. cursor is at 0,0.
				return [];
			})( A.length, B.length );
		}
,		
		
		
		/**
		 * Get the common prefix of two arrays, using the current _compareLines
		 * ( e.g., all lines before the first non-match )
		 *
		 * @uses this._compareLines
		 * 
		 * @param {Array} A
		 * @param {Array} B
		 * 
		 * @return {Array}
		 */
		'_commonPrefix': function _commonPrefix( A, B ) { 
			var ret = [];
			for( k = 0; k < Math.min( A.length, B.length); k++ ) {
				if( !this._compareLines( A[k], B[k] ) ) break;
				ret.push( [ B[k] ] )
			}
			return ret;
		},
		
		/**
		 * Tokenize one or more items
		 * @param {String|Array} lines
		 * @param {Int} token
		 * 
		 * @return {Array.Array}
		 * [
		 *   [ token, line1 ],
		 *   [ token, line2 ]
		 * ]
		 */
		'_tokenize':function _tokenize( lines, token ) {
			if( lines instanceof String ) lines = [lines];
			var ret = [];
			for( k = 0; k < lines.length; k++ ) {
				ret.push( [ token, lines[k] ] )
			}
			return ret;
		},
		
		/**
		 * Reduce the noise of a diff array.
		 * @param {Array.Array} diffArr @see _tokenize
		 * 
		 * @return {Array.Array} @see _tokenize
		 * [
		 *   [ token, line1 ],
		 *   [ token, line2 ]
		 * ]
		 */
		'_reduceNoise':function( diffArr ) {
			if( !diffArr.length ) return diffArr;
			var ret = []
			,	ins = []
			,	del = []
			;
			while( diffArr.length ){
				var line = diffArr.shift();
				switch( line[0] ){
					case this.INSERT:
						ins.push( line );
						break;
					case this.DELETE:
						del.push( line );
						break;
					case this.EQUALS:
						if( ins.length || del.length ){
							ret = ret.concat(
								ins,del
							);
							ins = [];
							del = [];
						}
						ret.push( line );
						break;
				}
			}
			
			return ret.concat( ins, del );;
		},
		
		/**
		 * Calculate a primitive noise value for the given diff on a scale of 0 to 1.
		 * 1 = no two are grouped
		 * 0 = completely grouped, no transitions.
		 * @private
		 * @orphan - with the implementation of TestExpect::_getDiffUsingLCS(), this function is not currently needed
		 * 
		 * @param {@see this._tokenize}
		 * 
		 * @return {Number}
		 */
		'_getNoiseValue':function _getNoiseValue( tokenizedDiff ) {
			if( tokenizedDiff.length <= 1 ) return 0;
			
			var noise = 0
			,	last = null
			;
			for( var i = 0; i < tokenizedDiff.length; i++ ) {
				if( tokenizedDiff[i][0] != last ) noise++;
				last = tokenizedDiff[i][0];
			}
			
			return ( ( noise - 1 ) / ( tokenizedDiff.length - 1 ) );
		},
		
		'_compareLines': function compareExact( A, B ) {
			return ( A == B );
		},
		
		'_pass': null,
		
		'_reset':function _reset() {
			this._diff = this._pass = null;
		},
		
		'DELETE':-1,
		'EQUALS':0,
		'INSERT':1
	}
);

var TestExpectRegEx = Class.create( TestExpect,
	{ '_compareLines':function compareRegExp( a, b ) {
			if( !( a instanceof RegExp ) ) {
				A = new RegExp( '^' + a + '$' );
			}
			return A.test( b );
		}
	}
);

var TestExpectF = Class.create( TestExpectRegEx,
	{
		'_compareLines':function compareFormated( $super, A, B ) {
			// Convert to regexp
			var a = A.replace( /([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!<>\|\:])/g, '\\$1' ).
						replaceAll( ['%u\\|b%','%b|u%'],'' ). // PHP 6+ 'u'
						replaceAll( '%binary_string_optional%','string' ). // PHP 6+: 'binary_string'
						replaceAll( '%unicode_string_optional%','string' ). // PHP 6+: 'Unicode string'
						replaceAll( ['%unicode\\|string%','%string|unicode%'], 'string'). // PHP 6+: 'unicode'
						replaceAll( '%s', '.+?' ).
						replaceAll( '%i', '[+\\-]?[0-9]+' ).
						replaceAll( '%d', '[0-9]+' ).
						replaceAll( '%x', '[0-9a-fA-F]+' ).
						replaceAll( '%f', '[+\\-]?\\.?[0-9]+\\.?[0-9]*(E-?[0-9]+)?' ).
						replaceAll( '%c', '.' )
						
					;
			return $super( a, B );
		}
	}
);