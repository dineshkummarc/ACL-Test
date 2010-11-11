--TEST--
Testing SplFileInfo::isWritable().
--DESCRIPTION--
Check to see if a file is writable.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
--FILE--
<?php

/* This can be changed to whatever you wish.  */
$testfile = ___FILESDIR___ . DIRECTORY_SEPARATOR . "existing_file";

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfile );
var_dump( $fileinfo->isWritable() );

$fileinfo = new SplFileInfo( "?" );
var_dump( $fileinfo->isWritable() );

?>
--EXPECT--
bool(true)
bool(false)
