--TEST--
Testing SplFileObject::current().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Retrieve the current line of the file.
--FILE--
<?php

$testcsvfile = ___FILESDIR___ . "\\existing_csv_file.csv";

$fo = new SplFileObject( $testcsvfile, "r" );
$fo->setFlags( SplFileObject::READ_CSV );

$values = $fo->current();

var_dump( $values );

?>
--EXPECT--
array(4) {
  [0]=>
  string(1) "a"
  [1]=>
  string(1) "b"
  [2]=>
  string(1) "c"
  [3]=>
  string(1) "d"
}
