--TEST--
Testing SplFileObject::fflush().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Flushes the output to the file.
--FILE--
<?php

$testfile = ___FILESDIR___ . "\\existing_file";
$fo = new SplFileObject( $testfile );

var_dump( $fo->fflush() );

?>
--EXPECT--
bool(true)
