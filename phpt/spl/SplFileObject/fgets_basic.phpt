--TEST--
Testing SplFileObject::fgets().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Gets a line from a file.
--FILE--
<?php

$file = ___FILESDIR___ . "\\file.csv";
$fo = new SplFileObject( $file );

$stringvalue = $fo->fgets();

print $stringvalue;

?>
--EXPECT--
a,b,c,d
