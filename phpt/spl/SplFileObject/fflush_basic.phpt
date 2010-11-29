--TEST--
Testing SplFileObject::fflush().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=all
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
