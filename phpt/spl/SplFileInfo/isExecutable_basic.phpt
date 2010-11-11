--TEST--
Testing SplFileInfo::isExecutable().
--DESCRIPTION--
Check to see if file is an executable.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
--FILE--
<?php

$testfile = ___FILESDIR___ . "\\existing_file";
$exefile = ___FILESDIR___ . "\\existential.exe";

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $exefile );
var_dump( $fileinfo->isExecutable() );

$fileinfo = new SplFileInfo( $testfile );
var_dump( $fileinfo->isExecutable() );

?>
--EXPECT--
bool(true)
bool(false)
