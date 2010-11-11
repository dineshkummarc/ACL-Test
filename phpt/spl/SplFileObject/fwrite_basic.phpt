--TEST--
Testing SplFileObject::fwrite().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Writing with two parameters length < and > input string length.
--FILE--
<?php

$file = ___FILESDIR___ . "\\existing_file";

$obj = New SplFileObject( $file, "w" );
$obj->fwrite( "test_write", 4 );

var_dump( file_get_contents( $file ) );

$obj = New SplFileObject( $file, "w" );
$obj->fwrite( "test_write", 12 );

var_dump( file_get_contents( $file ) );

?>
--EXPECT--
string(4) "test"
string(10) "test_write"
