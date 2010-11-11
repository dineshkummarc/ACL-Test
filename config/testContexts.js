var testContextLocal = new TestContext( 'local', 'C:\\pftt_files\\' );
var testContextShare = new TestContext_Mountable_WithCredentials(
								'local-mounted-share',
								'\\\\V-RYANBI\\pftt_files\\',
								'REDMOND\\v-ryanbi',
								'#$!1eNc3'
							);

var testContextsAll = (new TestContextStack).addItem(testContextLocal).addItem(testContextShare);