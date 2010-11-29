--TEST--
Testing SplFileObject::fgetcsv().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Gets a line from a file and parses as CSV fields.
--FILE--
<?php

$file = ___FILESDIR___ . "\\file.csv";
$fo = new SplFileObject( $file );

print_r( $fo->fgetcsv() );

?>
--EXPECT--
Array
(
    [0] => a
    [1] => b
    [2] => c
    [3] => d
)
