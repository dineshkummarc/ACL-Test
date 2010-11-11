--TEST--
Testing SplFileObject::getMaxLineLen().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Get the maximum line length.
--FILE--
<?php

$testFile = ___FILESDIR___ . "\\existing_file";

$fo = new SplFileObject( $testFile, "w" );
$fo->fwrite( "test_write" );

$fo->setMaxLineLen( 3 );  
print $fo->getMaxLineLen();

?>
--EXPECT--
3
