--TEST--
Testing SplFileInfo::__toString().
--DESCRIPTION--
Returns the path to the file as a string.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
--FILE--
<?php

$testfile = ___FILESDIR___ . "\\existing_file";

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfile );

print $testfile . "\r\n" . $fileinfo->__toString();

?>
--EXPECT--
___FILESDIR___\existing_file
___FILESDIR___\existing_file
