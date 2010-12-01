--TEST--
Testing SplFileObject::ftruncate().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=file
--DESCRIPTION--
Truncates the file to a given length.
--FILE--
<?php

$testFile = ___FILESDIR___ . "\\existing_file";

$fo = new SplFileObject( $testFile, "r+" );

if ( $fo->ftruncate( 10 ) )
{
	var_dump( file_get_contents( $testFile ) );
}

?>
--EXPECT--
string(10) "Created By"
