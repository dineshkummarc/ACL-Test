--TEST--
Testing SplFileInfo::getFilename().
--DESCRIPTION--
Get the name of a file locally or from URL.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
--FILE--
<?php

/* PFTT constants.  --Kris */
$testdir = ___FILESDIR___;
$testfile = "existing_text_file.txt";

$testfileprefix = substr( $testfile, 0, strrpos( $testfile, "." ) );
$testfilesuffix = strrchr( $testfile, "." );

$testfilepath = $testdir . "\\" . $testfile;

/* Remote variables.  --Kris */
$remotefileserver = "http://www.php.net";
$remotefilename = "index.php";
$remotefilepath = $remotefileserver . "/" . $remotefilename;

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfilepath );

print $testfile . "\r\n" . $fileinfo->getFilename() . "\r\n";

$fileinfo = new SplFileInfo( $remotefilepath );

print $remotefilename . "\r\n" . $fileinfo->getFilename();

?>
--EXPECT--
existing_text_file.txt
existing_text_file.txt
index.php
index.php
