--TEST--
Testing SplFileObject::seek().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Seek to the specified line.
--FILE--
<?php

$file = ___FILESDIR___ . "\\file.csv";

$fo = new SplFileObject( $file );
$fo->seek( 0 );

$data = $fo->fgets();

print $data;

?>
--EXPECT--
a,b,c,d
