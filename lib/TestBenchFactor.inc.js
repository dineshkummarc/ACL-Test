/**
 * TestbenchFactor is something that factors into the running of a test. This should be extended
 * by TestCase, TestContext, and TestMode.
 * This class provides a method for result objects to be attached to this object for further analysis
 */
var TestBenchFactor = Class.create({
	/**
	 * Attach a result object to this testBenchFactor.
	 */
	'attachResult':		function(resultObject){
							if(!this.results)
								this.results = [];
							this.results[this.results.length] = resultObject;
							return this;
						},
	'analyzeResults':	function() {
							var n = '\n', t = '\t'
							var resultsByStatus = {};
							for( var idx in this.results ){
								if( !( this.results[idx].status in resultsByStatus ) )
									resultsByStatus[this.results[idx].status] = [];
								resultsByStatus[this.results[idx].status][resultsByStatus[this.results[idx].status].length] = this.results[idx];
							}
							// if *everything* has the same status, return that status.
							if( Object.keys(resultsByStatus).length == 1 ){
								if( config.analysis.hideUninterestingResults && 
									!config.analysis.isInteresting[(Object.keys(resultsByStatus))[0]] ) {
									return false;
								}
								return '[' + (Object.keys(resultsByStatus))[0] + '] ' + this.describe();
							}
							
							// this testBenchFactor has mixed results. 
							// This is much more likely for TestMode objects and TestContext objects
							r = '[MIXED] ' + this.describe();
							var rBody = [];
							for( status in resultsByStatus ) {
								if( config.analysis.hideUninterestingResults && !config.analysis.isInteresting[status] )
									continue;
								rBody.push('[' + status + '] (' + Object.keys(resultsByStatus[status]).length + '/' + this.results.length + ')' );
								for( var resultItemIdx in resultsByStatus[status]) {
									var rItem = [t];
									for( var factorIdx in resultsByStatus[status][resultItemIdx].factors ){
										if( resultsByStatus[status][resultItemIdx].factors[factorIdx] != this )
											rItem.push(resultsByStatus[status][resultItemIdx].factors[factorIdx].describe());
									}
									rBody.push( rItem.join(' ') );
								}
							}
							return r + n + t + rBody.join( n + t );
						},
	/**
	 * Return a simple string describing this factor.
	 * 
	 * @return {String};
	 */
	'describe':			function(){
							return this.description;
						}
});