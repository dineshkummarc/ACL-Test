--TEST--
Testing SplFileInfo::getBaseName().
--DESCRIPTION--
Get the base name of a file without path information.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
--FILE--
<?php

/* Use PFTT constants.  --Kris */
$testdir = ___FILESDIR___;
$testfile = "existing_text_file.txt";

$testfileprefix = substr( $testfile, 0, strrpos( $testfile, "." ) );
$testfilesuffix = strrchr( $testfile, "." );

$testfilepath = $testdir . "\\" . $testfile;

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfilepath );

print $testfile . "\r\n" . $fileinfo->getBasename() . "\r\n";
print $testfileprefix . "\r\n" . $fileinfo->getBasename( $testfilesuffix );

?>
--EXPECT--
existing_text_file.txt
existing_text_file.txt
existing_text_file
existing_text_file
