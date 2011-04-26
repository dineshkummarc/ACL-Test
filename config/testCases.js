var testCasesAll = (new TestCaseStackLoader.Lazy('phpt'));
//var testCasesNoSPL = (new TestCaseStackLoader.Lazy('phpt',/\.phpt$/,/spl/i));

var testCasesIsLink = (new TestCaseStackLoader.Lazy('phpt',/(link|type)/i));
var testCasesCore = (new TestCaseStackLoader.Lazy('C:\\php\\php-src-5.3\\tests',/\.phpt$/));