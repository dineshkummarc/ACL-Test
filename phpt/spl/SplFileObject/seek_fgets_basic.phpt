--TEST--
Testing SplFileObject::seek().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Seek to the specified line.
--FILE--
<?php

$file = ___FILESDIR___ . "\\existing_csv_file.csv";

$fo = new SplFileObject( $file );
$fo->seek( 0 );

$data = $fo->fgets();

print $data;

?>
--EXPECT--
a,b,c,d
