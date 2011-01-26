var PhpConfig = Class.create( {
	/**
	 * Initializer
	 * @param {String|Array} @optional ini
	 * 
	 * @return {PhpConfig}
	 */
	initialize: function PhpConfig_initialize( ini ) {
		ini = ini || [];
		if( typeof( ini ) == 'string' ) {
			ini = ini.split(/(\n|\r\n)/);
		}
		this.tokens = [];
		for( var i = 0; i < ini.length; i++ ){
			this.tokens.push( this._tokenizeLine( ini[i] ) );
		}
	}

	/**
	 * Clone this, return clone
	 * 
	 * @return {PhpConfig}
	 */
,	clone: function PhpConfig_clone() {
		var phpConfig = new PhpConfig();
		for( var i = 0; i < this.tokens.length; i++ ) {
			phpConfig.tokens.push( this.tokens[i].slice(0) );
		}
		return phpConfig;
	}
	
	/**
	 * Concatenate ini settings on top of this one.
	 * @param {String|Array} ini
	 * 
	 * @return {PhpConfig} this
	 */
,	concat: function PhpConfig_concat( ini ) {
		var config = new PhpConfig( ini );
		this.append( config );
		return this;
	}
	
	/**
	 * If, we are looking to append a PhpConfig object, don't tokenize it again!
	 * @param {PhpConfig} phpConfig
	 * 
	 * @return {Integer} changesMade
	 */
,	append: function PhpConfig_append( phpConfig ) {
		var changes = 0;
		if( ! ( phpConfig instanceof PhpConfig ) ) 
			Assert.Fail( 'PhpConfig::append( phpConfig ) only takes PhpConfig instances as arguments' );

		var comments = [];
		for( var i = 0; i < phpConfig.tokens.length; i++ ){
			switch( phpConfig.tokens[i][0]){
				case this.COMMENT:
					comments.push(phpConfig.tokens[i]);
					break;
				case this.REMOVED:
					changes += this._unset( phpConfig.tokens[i], comments );
					comments = [];
					break;
				default:
					changes += this._set( phpConfig.tokens[i], comments );
					comments = [];
					break;
			}
		}
		return changes;
	}
	
	/**
	 * Internal function for tokenizing lines, one at a time
	 * @param {String} line
	 * 
	 * @return {Array[Integer,String,String,String]} token
	 */
,	_tokenizeLine: function PhpConfig__tokenizeLine( line ) {
		var token = [];
		token[1] = line;
		if( ( command = line.split(';').slice(0,1).join() ) && 
			!( /^[ ]*$/.test( command ) ) 
		) { 
			if( line.slice(0,1) == '-' ) {
				token[0] = this.REMOVED;
				line = line.slice(1);
			} else {
				token[0] = this.COMMAND;
			}
			                        //-----[  key   ]---eq---[ val or quoted val ]--
			var matches = line.match( /^[ ]*([a-z0-9_.]+)[ ]*=[ ]*(.*|"?([^"]+))[ ]*$/i ) 
			if( matches && matches.length ) {
				token[2] = matches[1]; // key
				token[3] = matches[3] || matches[2] || undefined; // quotedval or val
				return token;
			} else {
				Assert.Fail('Could not parse INI string: ['+line+']');
			}
		}
		token[0] = this.COMMENT;
		return token;
	}
	
	/**
	 * Find an occurance by token
	 * @wraps PhpConfig__findByKeyVal
	 * @param {Array} @see PhpConfig__tokenizeLine
	 * @param {Integer} startingAt
	 * 
	 * @return {Integer|False} @see PhpConfig__findByKeyVal
	 */
,	_find: function PhpConfig__find( token, startingAt ) {
		return this._findByKeyVal( token[2], token[3], startingAt );
	}
	
	/**
	 * Find an occurance using key/val
	 * @wraps PhpConfig__findByKeyVal
	 * @param {String} key
	 * @param {String|undefined} val
	 * @param {Integer} startingAt
	 * 
	 * @return {Integer|False}
	 */
,	_findByKeyVal: function PhpConfig__findByKeyVal( key, val, startingAt ) {
		startingAt = startingAt || 0;
		for( var i = startingAt; i < this.tokens.length; i++ ){
			if( this.tokens[i][0] <= this.COMMENT ) continue;
			if( key == this.tokens[i][2] ) { // keys match
				if( typeof( val ) == 'undefined') { return i; } // value not required
				if( val == this.tokens[i][3] ) { return i; } // value matches token
				if( val == '*' ) { return i; } // value matches token wildcard
			}
		}
		return false;
	}
	
	/**
	 * Set the status of all found tokens to REMOVED
	 * @param {Array} token @see PhpConfig__tokenizeLine
	 * @param {Array.Array} commentTokens @see PhpConfig__tokenizeLine
	 * 
	 * @return {Integer} changesMade
	 */
,	_unset: function PhpConfig__unset( token, commentTokens ) {
		var changes = 0;
		while( ( found = this._find( token ) ) !== false ) {
			this.tokens[ found ][0] = this.REMOVED;
			while( commentTokens.length ) {
				this.tokens.splice( found, 0, commentTokens.pop() );
			}
			changes++;
		}
		return changes;
	}
	
	/**
	 * Add the token & comments
	 * @param {Array} token @see PhpConfig__tokenizeLine
	 * @param {Array.Array} commentTokens @see PhpConfig__tokenizeLine
	 * 
	 * @return {Integer} changesMade
	 */
,	_add: function PhpConfig__add( token, commentTokens ) {
		this.tokens = this.tokens.concat( [ token ], commentTokens );
		return ( token[0] == this.COMMAND ? 1 : 0 );
	}
	
	/**
	 * Set the value of all found tokens
	 * @param {Array} token @see PhpConfig__tokenizeLine
	 * @param {Array.Array} commentTokens @see PhpConfig__tokenizeLine
	 * 
	 * @return {Integer} changesMade
	 */
,	_set: function PhpConfig__set( token, commentTokens ) {
		if( token[2] != 'extension' && 
			( found = this._findByKeyVal( token[2] ) ) !== false 
		) {
			if( this.tokens[found][3] == token[3] ) {
				return 0; // no changes
			}
			this.tokens[ found ][0] = this.REMOVED;
			this.tokens.splice( found, 0, token );
			while( commentTokens.length ) {
				this.tokens.splice( found, 0, commentTokens.pop() );
			}
			return 1;
		}
		return this._add( token, commentTokens );
	}
	
	/**
	 * Output this configuration for use as a php.ini file
	 * @param {String} @optional seperator @default '\n'
	 * 
	 * @return {String}
	 */
,	toString: function PhpConfig_toString(seperator){
		var ret = [];
		for( var i = 0; i < this.tokens.length; i++ ) {
			if( this.tokens[i][0] == this.REMOVED ) { 
				ret.push( ';REMOVED;' + this.tokens[i][1]);
				continue;
			}
			ret.push( this.tokens[i][1] );
		}
		return ret.join( seperator || '\n' );
	}
	
	/**
	 * Token Values
	 */
,	'UNKNOWN': -2	
,	'REMOVED': -1
,	'COMMENT':  0
,	'COMMAND':  1
});