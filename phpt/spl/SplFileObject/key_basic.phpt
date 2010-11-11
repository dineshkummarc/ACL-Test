--TEST--
Testing SplFileObject::key().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Get the line number.
--FILE--
<?php

$file = ___FILESDIR___ . "\\existing_csv_file.csv";

$fo = new SplFileObject( $file );

var_dump( $fo->key() );

?>
--EXPECT--
int(0)
