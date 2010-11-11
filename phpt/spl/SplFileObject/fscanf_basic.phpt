--TEST--
Testing SplFileObject::fscanf().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Parses input from a file according to a format.
--FILE--
<?php

$file = ___FILESDIR___ . "\\existing_csv_file.csv";

$fo = new SplFileObject($file);

var_dump( $fo->fscanf( "%s" ) );

?>
--EXPECT--
array(1) {
  [0]=>
  string(7) "a,b,c,d"
}
