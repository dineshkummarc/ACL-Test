--TEST--
Testing SplFileObject::getCurrentLine().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Alias of SplFileObject::fgets().
--FILE--
<?php

$file = ___FILESDIR___ . "\\existing_csv_file.csv";

$fo = new SplFileObject( $file );
$fo->seek( 1 );

print $fo->getCurrentLine();
print $fo->getCurrentLine();

?>
--EXPECT--
2,2,2
3,3,3
