--TEST--
Testing SplFileObject::key().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Get the line number.
--FILE--
<?php

$file = ___FILESDIR___ . "\\file.csv";

$fo = new SplFileObject( $file );

var_dump( $fo->key() );

?>
--EXPECT--
int(0)
