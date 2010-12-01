--TEST--
Testing SplFileObject::getCsvControl().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Get the delimiter and enclosure character for CSV.
--FILE--
<?php

$file = ___FILESDIR___ . "\\file.csv";

$fo = new SplFileObject( $file );
$ctrl =  $fo->getCsvControl();
echo 'delimeter: '; var_dump($ctrl[0]);
echo 'enclosure: '; var_dump($ctrl[1]);

?>
--EXPECT--
delimeter: string(1) ","
enclosure: string(1) """