--TEST--
Testing SplFileInfo::isDir().
--DESCRIPTION--
Check to see if a filesystem object is a directory.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
--FILE--
<?php

/* This can be changed to whatever you wish.  */
$testdir = ___FILESDIR___;

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testdir );
var_dump( $fileinfo->isDir() );

?>
--EXPECT--
bool(true)
