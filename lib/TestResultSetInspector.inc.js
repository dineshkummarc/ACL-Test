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
		,	testCase: 		parts[parts.length-1]	
		};
	},
	
	__untokenizeDescription: function( token ) {
		var ret = [];
		for( var k in token ) if(token[k]) ret.push( k + ':' + token[k]);
		return ret.join(' ');
	},
	
	__untokenizeAll: function( tokenArray ) {
		var ret = [];
		for( var i = 0; i < tokenArray.length; i++ )
			ret[i]=this.__untokenizeDescription(tokenArray[i]);
		return ret;
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
		
		var sep = ''.pad(30,'=');
		
		this._logRates( 'PASS RATES', LOG.PASSRATE );
		baseline._logRates( 'BASELINE PASS RATES ({0})'.Format(baseline.description) , LOG.PASSRATE_BASELINE);
		
		this._logScenarios( 'REGRESSIONS', 		this._getRegressions(baseline), 	LOG.COMPARE_RESULTS_REGRESSIONS )
		this._logScenarios( 'NEW PASSES', 		this._getNewPasses(baseline), 		LOG.COMPARE_RESULTS_NEWPASSES )
		this._logScenarios( 'MISSING SCENARIOS',this._getMissingScenarios(baseline),LOG.COMPARE_RESULTS_MISSING )
		this._logScenarios( 'NEW SCENARIOS', 	this._getNewScenarios(baseline), 	LOG.COMPARE_RESULTS_NEWSCENARIOS )
		
	},
	
	_getRegressions: function(baseline){
		return this.__untokenizeAll(
			Array.contrast( 
				Array.compare(
					this.byStatus['FAIL'] || [],
					baseline.all
				),
				baseline.byStatus['FAIL'] || [] 
			)
		);
	},
	
	_getNewScenarios: function(baseline){
		return this.__untokenizeAll(
			Array.contrast(
				this.all || [], 
				baseline.all || []
			)
		)
	},
	
	_getNewPasses: function(baseline){
		return this.__untokenizeAll(
			Array.contrast( 
				this.byStatus['PASS'] || [], 
				baseline.byStatus['PASS'] || [] 
			)
		);
	},
	
	_getMissingScenarios: function(baseline){
		return this.__untokenizeAll(
			Array.contrast(
				baseline.all || [],
				this.all || []
			)
		)
	},
	
	_logScenarios: function( title, scenarios, loglevel ){
		LOG( ''.pad(30,'='), loglevel );
		if( !scenarios.length ) {
			LOG( title + ': NONE', loglevel);
			return;
		}
		LOG( title, loglevel);
		LOG( scenarios.join('\n'), loglevel);
		LOG('');
	},
	
	_logRates: function( title, loglevel ) {
		var ret = [];
		for( var status in this.byStatus ) {
			ret.push( '{0} {1} ({2}%)'.Format(
					status,
					''+this.byStatus[status].length,
					''+Math.round( this.byStatus[status].length / this.all.length * 100 )
				)
			);
		}
		LOG( ''.pad(30,'='), loglevel );
		LOG( title, loglevel );
		LOG( ret.join('\n'), loglevel );
	}
});

LOG.registerConstant('COMPARE_RESULTS_REGRESSIONS');
LOG.registerConstant('COMPARE_RESULTS_NEWPASSES');
LOG.registerConstant('COMPARE_RESULTS_MISSING');
LOG.registerConstant('COMPARE_RESULTS_NEWSCENARIOS');
LOG.registerConstant('COMPARE_RESULTS', LOG.COMPARE_RESULTS_REGRESSIONS 
									|	LOG.COMPARE_RESULTS_NEWPASSES
									| 	LOG.COMPARE_RESULTS_MISSING 
									| 	LOG.COMPARE_RESULTS_NEWSCENARIOS 
					);
LOG.registerConstant('PASSRATE');
LOG.registerConstant('PASSRATE_BASELINE');

var TestResultSetInspector_TestResultStack = Class.create( TestResultSetInspector, {
	initialize: function( $super, testResultStack ) {
		this.testResultStack = testResultStack;
		$super();
	},
	
	_loadTokens: function() {
		var tokensByStatus = {}
		,	testResult
		;
		
		for( var status in this.testResultStack.byStatus ){
			if( Object.isUndefined( tokensByStatus[status] ) ) tokensByStatus[status] = [];
			var p = this.testResultStack.byStatus[status].getPointer();
			while( testResult = this.testResultStack.byStatus[status].getNext( p ) ) {
				tokensByStatus[status].push( this.__tokenizeDescription( testResult.describe() ) );
			}
		}
		return tokensByStatus;
	}
});

var TestResultSetInspector_File = Class.create( TestResultSetInspector, {
	initialize:	function( $super, resultDirectoryPath ) {
		this.resultDirectoryPath = resultDirectoryPath;
		$super();
	},
	
	_loadTokens: function() {
		var resultDir = $$.fso.GetFolder( this.resultDirectoryPath )
		,	fC = new Enumerator( resultDir.Files )
		,	tokensByStatus = {}
		;
		for(; !fC.atEnd(); fC.moveNext() ) {
			var tF = fC.item();
			if( !tF.Name.match( /\.list/i ) ) continue;
			var status = tF.Name.split('.').slice(0,-1).join('.').toUpperCase();
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

