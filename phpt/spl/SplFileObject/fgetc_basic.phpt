--TEST--
Testing SplFileObject::fgetc().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Retrieve a single character from a file.
--FILE--
<?php

$testcsvfile = ___FILESDIR___ . "\\existing_csv_file.csv";
$fo = new SplFileObject( $testcsvfile );

var_dump( $fo->fgetc() );

?>
--EXPECT--
string(1) "a"
