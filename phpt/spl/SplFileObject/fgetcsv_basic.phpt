--TEST--
Testing SplFileObject::fgetcsv().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Gets a line from a file and parses as CSV fields.
--FILE--
<?php

$file = ___FILESDIR___ . "\\existing_csv_file.csv";
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
