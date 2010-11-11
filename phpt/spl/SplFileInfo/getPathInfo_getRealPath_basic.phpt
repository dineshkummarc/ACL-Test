--TEST--
Testing SplFileInfo::getPathInfo() and SplFileInfo::getRealPath().
--DESCRIPTION--
Gets an SplFileInfo object for the path.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
--FILE--
<?php

/* This can be changed to whatever you wish.  */
$testfile = ___FILESDIR___ . "\\existing_file";

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfile );

$parentinfo = $fileinfo->getPathInfo();

print ___FILESDIR___ . "\r\n" . $parentinfo->getRealPath();

?>
--EXPECT--
___FILESDIR___
___FILESDIR___
