--TEST--
Testing SplFileInfo::getFilename().
--DESCRIPTION--
Get the name of a file locally or from URL.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=txt
--FILE--
<?php

/* PFTT constants.  --Kris */
$testdir = ___FILESDIR___;
$testfile = "file.txt";

$testfileprefix = substr( $testfile, 0, strrpos( $testfile, "." ) );
$testfilesuffix = strrchr( $testfile, "." );

$testfilepath = $testdir . "\\" . $testfile;

/* Remote variables.  --Kris */
$remotefileserver = "http://www.php.net";
$remotefilename = "index.php";
$remotefilepath = $remotefileserver . "/" . $remotefilename;

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfilepath );

print 'Local file:  '; var_dump( $fileinfo->getFilename() );

$fileinfo = new SplFileInfo( $remotefilepath );

print 'Remote file: '; var_dump( $fileinfo->getFilename() );

?>
--EXPECT--
Local file:  string(8) "file.txt"
Remote file: string(9) "index.php"
