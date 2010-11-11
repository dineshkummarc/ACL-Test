--TEST--
Testing SplFileObject::getpath().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--Description--
Get the path to a file.
--FILE--
<?php

$testFile = ___FILESDIR___ . "\\existing_file";

$fo = new SplFileObject( $testFile );
print $fo->getPath();

?>
--EXPECT--
___FILESDIR___
