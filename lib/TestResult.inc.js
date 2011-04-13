/**
 * TestResult
 */
var TestResult = Class.create({
	/**
	 * Attach all of this result's factors to it.
	 * @param {Object} {'factorTypeString':testBenchFactor1}
	 * 
	 * @return {TestResult}
	 */
	'attachToFactors':
					function( testBenchFactors ) {
						this.factors = {};
						for(var idx in testBenchFactors){
							this.factors[idx] = testBenchFactors[idx];
							this.factors[idx].attachResult(this);
						}
						return this;
					},
	/**
	 * Get a one-line description of what went into this result.
	 * 
	 * @return {String}
	 */
	'oneLine':		function(){
						r = '['+this.status+']';
						for(factor in this.factors){
							r += ' ' + this.factors[factor].describe();
						}
						
						if( !Object.isUndefined( this.cost ) ) {
							r+= ' ' + (
								this.cost < 1 ? '<1' : this.cost
							) + 'ms';
						}
						return r;
					},
	'initialize': function( testCase ){ this.testCase = Object.clone(testCase); },
	/**
	 *
	 */
	'getSavePath': 	function(){
						var path = [config.log];
						path.push( 
							getRelativePath( 
								'{$ScriptPath}\\phpt'.Format(), 
								$$.fso.GetFile( this.testCase.phptPath ).Path 
							).replace( /^(\.\.\\)+/, '') // we want relative path, but not all the ..\'s
						);
						for( var fN in this.factors ){
							if( this.factors[fN] instanceof TestCase ) { continue; }
							path.push( this.factors[fN].describe() );
						}
						return path.join('\\');
					},
	'describe':		function(){
						var description = [];
						for( var fN in this.factors ){
							description.push( this.factors[fN].describe() );
						}
						return description.join(' ');
					},
	'save':			function(){
						var savePath = this.getSavePath()
						,	outputPhpt = $$.fso.BuildPath( savePath, this.testCase.phptPath.split('\\').pop() )
						;
						
						if( !($$.fso.FolderExists( savePath ) ) )
							mkdirRecursive(savePath);
						
						this.testCase.save( savePath, 'post-replace.phpt' );
						copy( this.testCase.phptPath, outputPhpt );
						
						var statusPath = $$.fso.BuildPath(
							config.log,
							this.status + '.linklist'
						);
						
						if( !$$.fso.FileExists( statusPath ) ) {
							var stream = $$.fso.CreateTextFile( statusPath );
						} else {
							var stream = $$.fso.OpenTextFile( statusPath, 8 );
						}
						stream.WriteLine( getRelativePath( config.log, outputPhpt ) );
						stream.Close();
						
						var statusPath = $$.fso.BuildPath(
							config.log,
							this.status + '.list'
						);
						
						if( !$$.fso.FileExists( statusPath ) ) {
							var stream = $$.fso.CreateTextFile( statusPath );
						} else {
							var stream = $$.fso.OpenTextFile( statusPath, 8 );
						}
						stream.WriteLine( this.describe() );
						stream.Close();
					}
});



/**
 * TestResultPass
 */
var TestResultPass = Class.create( TestResult, {
	/**
	 * Set the default status for this testResultPass to PASS
	 */
	'status':		'PASS'
});



/**
 * TestResultFail
 */
var TestResultFail = Class.create( TestResult, {
	/**
	 * Set the default status for this testResultPass to FAIL
	 */
	'status':		'FAIL',
	
	/**
	 * Constructor for Fails that adds functionality to the constructor for general
	 * TestResults
	 * @param {String} expect
	 * @param {String} actual
	 * 
	 * @return {TestResultFail}
	 */
	'initialize':	function( $super, testCase, actual ) {
						$super( testCase ); 
						this.actual = actual;
					},
	'save':			function( $super ){
						$super();
						var outputDir = this.getSavePath();
						// save the FILE section as .php
						this.testCase.saveSection( 'FILE', outputDir, '.php');
						
						// save the EXPECT-ish section as .expect(f|regex)?
						if( this.testCase.getSection('EXPECT') ){
							this.testCase.saveSection( 'EXPECT', outputDir, '.expect');
						} else if( this.testCase.getSection('EXPECTF') ){
							this.testCase.saveSection( 'EXPECTF', outputDir, '.expectf');
						} else if( this.testCase.getSection('EXPECTREGEX') ){
							this.testCase.saveSection( 'EXPECTREGEX', outputDir, '.expectregex');
						}
						
						// save the output as a .result
						this.testCase.loadSection('RESULT',this.actual);
						this.testCase.saveSection( 'RESULT', outputDir, '.result');
						this.testCase.unloadSection('RESULT');
						
						// save the diff as a .diff
						this.testCase.loadSection('DIFF',this.testCase.generateDiff().toString());
						this.testCase.saveSection( 'DIFF', outputDir, '.diff');
						this.testCase.unloadSection('DIFF');
					}
});



/**
 * TestResultSkip
 */
var TestResultSkip = Class.create( TestResult, {
	/**
	 * Set the default status for this testResultPass to SKIP
	 */
	'status':		'SKIP',
	
	/**
	 * Constructor for Skips that adds functionality to the constructor for general
	 * TestResults
	 * @param {String} reason
	 * 
	 * @return {TestResultFail}
	 */
	'initialize':	function( $super, testCase, reason ) {
						$super( testCase );
						this.reason = reason;
					}
});



/**
 * TestResultBork
 */
var TestResultBork = Class.create( TestResult, {
	/**
	 * Set the default status for this testResultPass to BORK
	 */
	'status':'BORK',
	
	/**
	 * Constructor for Skips that adds functionality to the constructor for general
	 * TestResults
	 * @param {String} reason
	 * 
	 * @return {TestResultFail}
	 */
	'initialize':	function( reason, actual ) {
						this.reason = reason;
						this.actual = actual;
					},
	/**
	 * Attach a test case. This is done after the item has been created and thrown, since
	 * it is not necessarily available to the thrower.
	 */
	'attachTestCase': function( testCase ) {
						this.testCase = Object.clone( testCase );
					},
	'save':			function( $super ){
						$super();
						var outputDir = this.getSavePath();
						// save the FILE section as .php
						this.testCase.saveSection( 'FILE', outputDir, '.php');
						
						// save the EXPECT-ish section as .expect(f|regex)?
						if( this.testCase.getSection('EXPECT') ){
							this.testCase.saveSection( 'EXPECT', outputDir, '.expect');
						} else if( this.testCase.getSection('EXPECTF') ){
							this.testCase.saveSection( 'EXPECTF', outputDir, '.expectf');
						} else if( this.testCase.getSection('EXPECTREGEX') ){
							this.testCase.saveSection( 'EXPECTREGEX', outputDir, '.expectregex');
						}
						
						// save the output as a .result
						this.testCase.loadSection('RESULT',this.actual);
						this.testCase.saveSection( 'RESULT', outputDir, '.bork.result');
						this.testCase.unloadSection('RESULT');
					}
});

/**
 * Create a custom stack class to hold TestResult items
 */
var TestResultStack = Class.create( Stack, {
	/**
	 * Constructor function
	 * @param {Boolean} optional subStackItemsByStatus default true
	 * 
	 * @return {TestResultStack}
	 */
	'initialize':	function( $super, subStackItemsByStatus ){
						if( ( typeof( subStackItemsByStatus ) == 'undefined' ) || subStackItemsByStatus ){
							this.subStackItemsByStatus = true;
							this.byStatus={};
						}
						return $super();
					},
	/**
	 * Add a TestResult item to the stack. If the stack is set to substack incoming
	 * items, do so before adding this.
	 * @param {TestResult} itemToAdd
	 * 
	 * @return {TestResultStack};
	 */
	'addItem':		function( $super, itemToAdd ){
						if( !( itemToAdd instanceof TestResult ) )
							throw new Error('TestResultStack only accepts TestResult items');
						if(this.subStackItemsByStatus){
							if( !( itemToAdd.status in this.byStatus ) )
								this.byStatus[itemToAdd.status] = new TestResultStack(false);
							this.byStatus[itemToAdd.status].addItem( itemToAdd );
						}
						return $super( itemToAdd );
					},
	'summarize':	function(){
						var sep = '==================================='
						var r = sep + '\n' + 'Total test scenarios run: ' + this.items.length;
						if(this.subStackItemsByStatus){
							for(var status in this.byStatus){
								r+='\n\t'+status+': '+this.byStatus[status].items.length;
							}
						}
						r+= '\n' + sep;
						return r;
					}
});


/**
 * Create a c-c-c-combo test result for use with ACL. Essentially, using a stack for ACL permutations would cause
 * all results to live on in memory indefinitely, which is prohibitive. Using a TestResult subclass also means
 * that we can essentially use map:reduce functionality for their permutations. win-win.
 */
var TestResultACL = Class.create( TestResult,{
	/**
	 * Append a result onto this one and return this
	 * 
	 * @param {TestResult} testResult
	 *
	 * @return {TestResultACL} this
	 */
	'append':	function(
					testResult
				) {
					// Set the status of this object
					if( Object.isUndefined( this.status ) ){
						this.status = testResult.status;
					} else if( this.status != testResult.status ) {
						this.status = 'MIXED';
					}
					
					// If the incoming item is one of me, shortcut
					if( ( testResult instanceof this.constructor ) ){
						for( var st in testResult.results ){
							if( Object.isUndefined(this.results[st]) ){
								this.results[st] = new Array();
							}
							this.results[st].push( testResult.results[st] );
						}
					} else {
						this.results[testResult.status] = new Array(
							testResult.ace
						);
					}
					return this;
				},
	'analyze':	function(){
					
				}
});











































