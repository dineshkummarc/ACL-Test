--TEST--
Testing SplFileObject::fgets().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Gets a line from a file.
--FILE--
<?php

$file = ___FILESDIR___ . "\\existing_csv_file.csv";
$fo = new SplFileObject( $file );

$stringvalue = $fo->fgets();

print $stringvalue;

?>
--EXPECT--
a,b,c,d
