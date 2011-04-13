var TestResultSetInspector = Class.create({
	/**
	 * Turn a line into a token. 
	 * @param {String} line - TestMode [TestContext [TestContext]] TestCase.
	 * 
	 * @return {Object} - {TestMode:String, TestContextA:String|Null, TestContextB:String|Null, TestCase:String}
	 */
	__tokenizeDescription: function( description ){
		var parts = description.split(' ')
		return {
			testMode: 		parts[0]
		,	testContextA: ( parts.length>2 ? parts[1] : null )
		,	testContextB: ( parts.length>3 ? parts[2] : null )
		,	testCase: 		parts[parts.legnth-1]	
		};
	},
	
	initialize: function() {
		var tokensByStatus = this._loadTokens()
		,	allTokens = []
		,	commonBits = null;
		;
		
		// find out what the testMode portion of the tokens are common to all of them.
		for( var status in tokensByStatus )
			allTokens = allTokens.concat( tokensByStatus[status] )
			
		for( var i=0; i<allTokens.length; i++ ) {
			if( commonBits == null ){
				commonBits = allTokens[i]['testMode'].split('-');
				continue;
			}
			commonBits = Array.compare( commonBits, allTokens[i]['testMode'].split('-') );
		}
		if( !commonBits.length ) Assert.Fail( 'Nothing common accross test modes in this stack. Cannot compare.' );
		
		this.description = commonBits.join('-');
		
		for( var i=0; i<allTokens.length; i++ ) {
			allTokens[i]['testMode'] = ( Array.contrast( allTokens[i]['testMode'].split('-'), commonBits ) ).join('-');
		}
		
		this.all = allTokens;
		this.byStatus = tokensByStatus;
	},
	
	compareAgainstBaseline: function( baseline ){
		if( ! baseline instanceof TestResultSetInspector ) Assert.Fail( 'Expected object of type TestResultSetInspector' );
		
		newTests = Array.contrast( this.all, baseline.all );
		
		newFailures = Array.contrast( this.byStatus['FAIL'], Array.compare( this.all, baseline.byStatus['FAIL'] ) );
	},
	
	getRates: function() {
		var rates = {};
		for( var status in this.byStatus ) {
			rates[status] = Math.round( this.byStatus.length / this.all.length );
		}
		return rates;
	}
});

var TestResultSetInspector_TestResult = Class.create( TestResultSetInspector, {
	initialize: function( testResultStack ) {
		this.testResultStack = testResultStack;
		$super();
	},
	
	_loadTokens: function() {
		var tokensByStatus = {}
		,	testResult
		;
		
		for( var status in this.testResultStack.byStatus ){
			if( Object.isUndefined( tokensByStatus[status] ) ) tokensByStatus[status] = [];
			var p = this.testResultStack.byStatus.getPointer();
			while( testResult = this.testResultStack.byStatus.getNext( p ) ) {
				tokensByStatus[status].push( this.__tokenizeDescription( testResult.describe() ) );
			}
		}
		return tokensByStatus;
	}
});

var TestResultInspector_File = Class.create( TestResultSetInspector, {
	initialize:	function( resultDirectoryPath ) {
		this.resultDirectoryPath;
		$super();
	},
	
	_loadTokens: function() {
		var fC = new Enumerator( $$.fso.GetFolder( this.resultDirectoryPath ) )
		,	tokensByStatus = {}
		;
		for(; !fC.atEnd(); fC.moveNext() ) {
			var tF = fC.item();
			if( !tF.Name.match( /\.list/i ) ) continue;
			var status = tF.Name.split('.').splice(0,-1).join('.').toUpperCase();
			if( Object.isUndefined( tokensByStatus[status] ) ) tokensByStatus[status] = [];
			
			var resultFile = $$.fso.OpenTextFile( tF.Path, 1 /* FOR_READING */ );
			while (!resultFile.AtEndOfStream){
				tokensByStatus[status].push( this.__tokenizeDescription( resultFile.ReadLine() ) );
			}
			resultFile.Close();
		}
		return tokensByStatus;
	}
});