--TEST--
Testing SplFileObject::getRealPath().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
SplFileObject::getRealPath() Which inherits SplFileObject().
--FILE--
<?php

$testFile = ___FILESDIR___ . "\\existing_file";

$fo = new SplFileObject( $testFile, "w" );

print $fo->getRealPath();

?>
--EXPECT--
___FILESDIR___\existing_file
