--TEST--
Testing SplFileInfo::getPathname().
--DESCRIPTION--
Retrieve the path name of a file.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=file
--FILE--
<?php

$testfile = ___FILESDIR___ . "\\existing_file";

$fileinfo = new SplFileInfo( $testfile );

print $testfile . "\r\n" . $fileinfo->getPathname();

?>
--EXPECT--
___FILESDIR___\existing_file
___FILESDIR___\existing_file
