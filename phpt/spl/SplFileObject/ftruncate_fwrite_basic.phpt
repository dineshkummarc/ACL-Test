--TEST--
Testing SplFileObject::ftruncate().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Truncates the file to a given length.
--FILE--
<?php

$str = "Some Test conducted by Professor Zuugle van Xuble-Flugleheimer VIII.";

$testFile = ___FILESDIR___ . "\\existing_file";

$fo = new SplFileObject( $testFile, "w+" );
$fo->fwrite( $str );

if ( $fo->ftruncate( 10 ) )
{
	var_dump( file_get_contents( $testFile ) );
}

?>
--EXPECT--
string(10) "Some Test "
