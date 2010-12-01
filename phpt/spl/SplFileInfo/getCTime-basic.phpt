--TEST--
Testing SplFileInfo::getCTime().
@uses fopen()
@uses fputs()
@uses flcose()
@uses unlink()
--DESCRIPTION--
Check to see when a file inode (permissions, contents, etc) was changed.  On Windows, only file creation can alter this.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
--FILE--
<?php

/* We have to manually create the file so we can get the exact creation time for Windows compatibility.  --Kris  */
$testfile = ___FILESDIR___ . "\\temp_file";

/* Create the test file with static contents.  --Kris */
$filecontents = "This is a test file.  This file should be used with SplFileInfo.  Use it at your own risk.  There is no lifeguard on duty.  Batteries not included.  So there.";

$handle = fopen( $testfile, "w" );
fputs( $handle, $filecontents );
fclose( $handle );

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfile );

/* Allow +/- 5 seconds to account for CPU lag.  --Kris */
var_dump( abs( $fileinfo->getCTime() - time() ) < 5 );

/* Cleanup.  --Kris */
unlink( $testfile );

?>
--EXPECT--
bool(true)
