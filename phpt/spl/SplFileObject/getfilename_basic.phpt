--TEST--
Testing SplFileObject::getFilename().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=all
--DESCRIPTION--
SplFileObject::getFilename() Which inherits SplFileObject().
--FILE--
<?php

$testFile = ___FILESDIR___ . "\\existing_file";

$fo = new SplFileObject( $testFile );

var_dump( $fo->getFilename() );

?>
--EXPECT--
string(13) "existing_file"
