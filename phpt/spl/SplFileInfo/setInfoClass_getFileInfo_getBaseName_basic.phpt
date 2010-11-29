--TEST--
Testing SplFileInfo::setInfoClass() and SplFileInfo::getFileInfo().
--DESCRIPTION--
Set a file class and retrieve.  Requires the use of getBaseName() to output predictable results.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=all
--FILE--
<?php

/* This can be changed to whatever you wish.  */
$testfile = ___FILESDIR___ . "\\existing_file";

/* Create the class.  --Kris */
class MyInfo extends SplFileInfo {}

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfile );

$fileinfo->setInfoClass( "MyInfo" );

$myinfo = $fileinfo->getFileInfo();

var_dump( $myinfo->getBaseName() );

?>
--EXPECT--
string(13) "existing_file"
