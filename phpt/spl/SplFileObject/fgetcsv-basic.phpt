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
print_r( $fo->fgetcsv() ); // make sure it advances the cursor

?>
--EXPECT--
Array
(
    [0] => a
    [1] => b
    [2] => c
    [3] => d
)
Array
(
    [0] => 1
    [1] => 1
    [2] => 1
)
