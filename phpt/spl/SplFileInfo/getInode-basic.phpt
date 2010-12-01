--TEST--
Testing SplFileInfo::getInode().
--DESCRIPTION--
Get the inode number for the filesystem object.  This test is designed specifically for Windows.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=file
--FILE--
<?php

/* According to http://us2.php.net/manual/en/splfileinfo.getinode.php, this will always return int(0) on Windows.  --Kris */

$testfile = ___FILESDIR___ . "\\existing_file";

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfile );
var_dump( $fileinfo->getInode() );

?>
--EXPECT--
int(0)
