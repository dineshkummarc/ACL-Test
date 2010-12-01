--TEST--
Testing SplFileObject::getMaxLineLen().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Get the maximum line length.
--FILE--
<?php

$testFile = ___FILESDIR___ . "\\file.csv";

$fo = new SplFileObject( $testFile, "r+" );

echo 'default: '; var_dump( $fo->getMaxLineLen() );
$i=0; foreach( $fo as $line ) $i++;
echo 'count: '; var_dump( $i );
echo "\n";

echo 'set: '; var_dump( 3 ); $fo->setMaxLineLen( 3 );
echo 'get: '; var_dump( $fo->getMaxLineLen() );
$i=0; foreach( $fo as $line ) $i++;
echo 'count: '; var_dump( $i );

?>
--EXPECT--
default: int(0)
count: int(5)

set: int(3)
get: int(3)
count: int(20)
