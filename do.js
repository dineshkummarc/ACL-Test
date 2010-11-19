eval(include('{$ScriptPath}\\lib\\TestBench.inc.js'));
var testBench = new TestBench( config.testBenchFactors.cases, config.testBenchFactors.contextsFiles );

testBench.run( config.testBenchFactors.modes );