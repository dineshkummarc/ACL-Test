--TEST--
Testing SplFileObject::isFile().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Test for isFile() using SplFileObject.
--FILE--
<?php

$testFile = ___FILESDIR___ . "\\existing_file";

$fo = new SplFileObject( $testFile );

var_dump( $fo->isFile() );

?>
--EXPECT--
bool(true)
