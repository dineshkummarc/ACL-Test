--TEST--
Testing SplFileObject::fpassthru().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Output all remaining data on a file pointer.
--FILE--
<?php

$file = ___FILESDIR___ . "\\file.csv";
$fo = new SplFileObject( $file );

$fo->fpassthru();

?>
--EXPECT--
a,b,c,d
1,1,1
2,2,2
3,3,3
4,4,4
