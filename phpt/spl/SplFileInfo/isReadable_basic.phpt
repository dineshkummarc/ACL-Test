--TEST--
Testing SplFileInfo::isReadable().
--DESCRIPTION--
Check to see if a file is readable.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
--FILE--
<?php

/* This can be changed to whatever you wish.  */
$testfile = ___FILESDIR___ . "\\existing_file";

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfile );
var_dump( $fileinfo->isReadable() );

$fileinfo = new SplFileInfo( "This shouldn't exist." );
var_dump( $fileinfo->isReadable() );

?>
--EXPECT--
bool(true)
bool(false)
