--TEST--
Testing SplFileInfo::getMTime().
--DESCRIPTION--
Check to see when a file was last modified.
@uses fopen()
@uses fputs()
@uses flose()
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=file
--FILE--
<?php

$testfile = ___FILESDIR___ . "\\existing_file";

/* Change the file contents to accurately capture the modification time.  --Kris */
$filecontents = "This is a test file.  This file should be used with SplFileInfo.  Use it at your own risk.  There is no lifeguard on duty.  Batteries not included.  So there.";

$handle = fopen( $testfile, "w" );
fputs( $handle, $filecontents );
fclose( $handle );

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfile );

/* Allow +/- 5 seconds to account for CPU lag.  --Kris */
var_dump( abs( $fileinfo->getMTime() - time() ) < 5 );

?>
--EXPECT--
bool(true)
