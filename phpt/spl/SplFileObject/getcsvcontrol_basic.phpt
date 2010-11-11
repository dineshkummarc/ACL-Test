--TEST--
Testing SplFileObject::getCsvControl().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Get the delimiter and enclosure character for CSV.
--FILE--
<?php

$file = ___FILESDIR___ . "\\existing_csv_file.csv";

$fo = new SplFileObject( $file );
print_r( $fo->getCsvControl() );

?>
--EXPECT--
Array
(
    [0] => ,
    [1] => "
)
