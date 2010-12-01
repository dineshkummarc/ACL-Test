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

foreach( $fo as $line ){
	var_dump( $fo->key() );
}

?>
--EXPECT--
int(0)
int(1)
int(2)
int(3)
int(4)
