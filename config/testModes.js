var testModeStackControl = TestModeStackBuilder.build('C:\\php-builds\\control',TMSB.ALL,'control');
var testModeStackPatched = TestModeStackBuilder.build('C:\\php-builds\\patched',TMSB.ALL,'patched');
var testModeStackCompare = (new TestModeStack)
	.addStack( testModeStackControl )
	.addStack( testModeStackPatched )
;
var testModeStackCLI = TestModeStackBuilder.build('C:\\php-builds\\control',TMSB['CLI-NTS']|TMSB['CLI-ZTS'],'control');

testModeApache = TestModeStackBuilder.build('C:\\php-builds\\control',TMSB.APACHE_MODPHP,'r304084');
testModeStackApacheMultiple = (new TestModeStack)
	.addStack(testModeApache)
	.addStack(testModeApache)
	.addStack(testModeApache)
	.addStack(testModeApache)
	.addStack(testModeApache)
	.addStack(testModeApache)
	.addStack(testModeApache)
	.addStack(testModeApache)
;
