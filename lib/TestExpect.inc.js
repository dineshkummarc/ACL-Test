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
			this._expect = expectStr.split(/(\n|\r\n)+/);
			this._result = resultStr.split(/(\n|\r\n)+/);
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
			if( ( A.length + B.length ) < 20 ) { //WL('_diffMap:'+A.length+':'+B.length);
				// the fast options have failed us, map:reduce to the rescue
				var map = this._diffMap( A, B )
				,	minCost = null
				,	minNoise = null
				,	minIndex = null
				,	n = 0
				;
				//WL('_diffMap exit');
				for( var i = 0; i < map.length; i++ ) {
					if( minCost == null || 
						map[i][1] < minCost ||
						( ( map[i][1] == minCost ) && ( ( n = this._getNoiseValue(map[i][0]) ) < minNoise ) )
					) {
						minIndex = i;
						minCost = map[i][1];
						minNoise = n;
					}
				}
				if( minIndex !== null ) {
					return map[minIndex][0]
				}
			}
			// map::reduce failed us, resort to less informative but still technically correct diff.
			return [].concat( 
				this._tokenize( A, this.DELETE ),
				this._tokenize( B, this.INSERT ) 
			);
			
		},
		
		/**
		 * Calculate a primitive noise value for the given diff on a scale of 0 to 1.
		 * 1 = no two are grouped
		 * 0 = completely grouped, no transitions.
		 * @private
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
			
		/**
		 * @param {Array) a
		 * @param {Array) b
		 * @param {Function} compareFunction
		 * @param {Array} sofar
		 *   [ Solution, cost ]
		 * 
		 * @return {Array}
		 *   [
		 *     [ SolutionA, costA ],
		 *     [ SolutionB, costB ],
		 *     [ SolutionC, costC ]
		 *	   ...
		 *   ]
		 */
		'_diffMap':function _diffMap( a, b, sofar ) {
			var P = ( ( typeof( sofar) == 'undefined' ) ? [[],0] : sofar )
			,	A = a.slice(0) // destructive, clone it first.
			,	B = b.slice(0) // destructive, clone it first.
			,	R = new Array()
			,	S = (new Array( P[0].length + 1 )).join(' ')
			;
			//WL( S + (new Date()).getTime());
			//WL( S + '_diffMap( [['+A+']], [['+B+']], [['+P+']])');
			if( !A.length ) {
				return [
					[ P[0].concat( this._tokenize( B, this.INSERT ) ), ( P[1] + B.length ) ]
				];
			}
			if( !B.length ) {
				return [
					[ P[0].concat( this._tokenize( A, this.DELETE ) ), ( P[1]+A.length)  ]
				];
			}
			// If we have a match
			if( this._compareLines( A[0], B[0] ) ) {
				// accept the match, advance both
				R = R.concat( 
					this._diffMap(
						A.slice(1), 
						B.slice(1),
						[
							P[0].concat( this._tokenize( [ B[0] ], this.EQUALS ) ),
							P[1]
						]
					)
				);
			} else { // no match, advance B
				R = R.concat(
					this._diffMap(
						A.slice(0), 
						B.slice(1),
						[
							P[0].concat( this._tokenize( [ B[0] ], this.INSERT ) ),
							P[1]+1
						]
					)
				);
			}
			// Assume A doesn't match and continure, advancing A
			R = R.concat(
				this._diffMap(
					A.slice(1),
					B.slice(0),
					[
						P[0].concat( this._tokenize( [ A[0] ], this.DELETE ) ),
						P[1]+1
					] 
				)
			);
			return R;
		},

		
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
				if( !this._compareLines( A[k], B[k] ) ) { break; }
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
						replace( '%s', '.+?' ).
						replace( '%i', '[+\\-]?[0-9]+' ).
						replace( '%d', '[0-9]+' ).
						replace( '%x', '[0-9a-fA-F]+' ).
						replace( '%f', '[+\\-]?\\.?[0-9]+\\.?[0-9]*(E-?[0-9]+)?' ).
						replace( '%c', '.' );
				
			return $super( a, B );
		}
	}
);