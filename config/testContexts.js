var testContextLocal = new TestContext( 'local', 'C:\\pftt_files\\' );

var testContextsAll = (new TestContextStack).addItem(testContextLocal);