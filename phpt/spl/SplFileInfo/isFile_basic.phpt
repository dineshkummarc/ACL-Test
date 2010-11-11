--TEST--
Testing SplFileInfo::isFile().
--DESCRIPTION--
Check to see if a filesystem object is a file.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
--FILE--
<?php

/* This can be changed to whatever you wish.  */
$testfile = ___FILESDIR___ . "\\existing_file";

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfile );
var_dump( $fileinfo->isFile() );

?>
--EXPECT--
bool(true)
