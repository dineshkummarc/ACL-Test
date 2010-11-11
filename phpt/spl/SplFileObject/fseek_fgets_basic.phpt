--TEST--
Testing SplFileObject::fseek().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Seek to a position.
--FILE--
<?php

$file = ___FILESDIR___ . "\\existing_csv_file.csv";

$fo = new SplFileObject( $file );
$fo->fseek( 0 );

$data = $fo->fgets();

print $data;

?>
--EXPECT--
a,b,c,d
