--TEST--
Testing SplFileInfo::getPath().
--DESCRIPTION--
Retrieve the path leading to a file.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=file
--FILE--
<?php

/* Use this with run-tests.php.  --Kris */
/*
$pathdata = array();
$pathdata = pathinfo( trim( $_SERVER["TEST_PHP_EXECUTABLE"], "\"" ) );

//Do the test and output the results.  --Kris
$fileinfo = new SplFileInfo( trim( $_SERVER["TEST_PHP_EXECUTABLE"], "\"" ) );
var_dump( ( $pathdata["dirname"] == $fileinfo->getPath() ) );
*/

/* Use this with PFTT.  --Kris */

$fileinfo = new SplFileInfo( ___FILESDIR___ . "\\existing_file" );

print ___FILESDIR___ . "\r\n" . $fileinfo->getPath();


?>
--EXPECT--
___FILESDIR___
___FILESDIR___
