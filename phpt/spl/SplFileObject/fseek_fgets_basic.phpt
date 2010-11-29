--TEST--
Testing SplFileObject::fseek().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Seek to a position.
--FILE--
<?php

$file = ___FILESDIR___ . "\\file.csv";

$fo = new SplFileObject( $file );
$fo->fseek( 0 );

$data = $fo->fgets();

print $data;

?>
--EXPECT--
a,b,c,d
