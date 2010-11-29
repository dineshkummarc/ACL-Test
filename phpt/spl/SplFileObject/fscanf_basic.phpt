--TEST--
Testing SplFileObject::fscanf().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Parses input from a file according to a format.
--FILE--
<?php

$file = ___FILESDIR___ . "\\file.csv";

$fo = new SplFileObject($file);

var_dump( $fo->fscanf( "%s" ) );

?>
--EXPECT--
array(1) {
  [0]=>
  string(7) "a,b,c,d"
}
