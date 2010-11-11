--TEST--
Testing SplFileInfo::isFile().
--DESCRIPTION--
Check to see if a filesystem object is a file.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
--FILE--
<?php

/* This can be changed to whatever you wish.  */
$testfilelink = ___FILESDIR___ . "\\symlink_to_existing_file";
$testdirlink = ___FILESDIR___ . "\\symlink_to_existing_folder";

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfilelink );
var_dump( $fileinfo->isLink() );

$fileinfo = new SplFileInfo( $testdirlink );
var_dump( $fileinfo->isLink() );

?>
--EXPECT--
bool(true)
bool(true)
