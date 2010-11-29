--TEST--
Testing SplFileObject::fgetc().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Retrieve a single character from a file.
--FILE--
<?php

$testcsvfile = ___FILESDIR___ . "\\file.csv";
$fo = new SplFileObject( $testcsvfile );

var_dump( $fo->fgetc() );

?>
--EXPECT--
string(1) "a"
