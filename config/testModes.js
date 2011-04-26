var testModeStackControl = TestModeStackBuilder.build('C:\\php-blds\\control',TMSB.ALL,'control');
var testModeStackPatched = TestModeStackBuilder.build('C:\\php-blds\\patched',TMSB.ALL,'patched');
var testModeStackCompare = (new TestModeStack)
	.addStack( testModeStackControl )
	.addStack( testModeStackPatched )
;
var testModeStack = TestModeStackBuilder.build('C:\\php-builds\\5.3.6\\GM',TMSB.ALL,'5.3.6GM');
