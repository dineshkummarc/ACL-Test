--TEST--
Testing SplFileObject::fpassthru().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Output all remaining data on a file pointer.
--FILE--
<?php

$file = ___FILESDIR___ . "\\existing_csv_file.csv";
$fo = new SplFileObject( $file );

$fo->fpassthru();

?>
--EXPECT--
a,b,c,d
1,1,1
2,2,2
3,3,3
4,4,4
