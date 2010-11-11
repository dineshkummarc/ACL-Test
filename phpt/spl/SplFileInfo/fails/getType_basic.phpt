--TEST--
Testing SplFileInfo::getType().
--DESCRIPTION--
Retrieve the file type.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
--FILE--
<?php

$testfile = ___FILESDIR___ . "\\existing_file";
$testdir = ___FILESDIR___;
$testlink = ___FILESDIR___ . "\\symlink_to_existing_file";
$testlink2 = ___FILESDIR___ . "\\symlink_to_existing_folder";

$fileinfo = new SplFileInfo( $testfile );
var_dump( $fileinfo->getType() );

$fileinfo = new SplFileInfo( $testdir );
var_dump( $fileinfo->getType() );

$fileinfo = new SplFileInfo( $testlink );
var_dump( $fileinfo->getType() );

$fileinfo = new SplFileInfo( $testlink2 );
var_dump( $fileinfo->getType() );

?>
--EXPECT--
string(4) "file"
string(3) "dir"
string(4) "link"
string(4) "link"
