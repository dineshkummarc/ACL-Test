var testCasesAll = (new TestCaseStack).loadFromPath('phpt');
var testCasesNoSPL = (new TestCaseStack).loadFromPath('phpt',/\.phpt$/,/spl/i);

var testCasesIsLink = (new TestCaseStack).loadFromPath('phpt',/(link|type)/i);