--TEST--
Testing SplFileObject::eof().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Reached the end of file.
--FILE--
<?php

$testcsvfile = ___FILESDIR___ . "\\file.csv";
$fo = new SplFileObject( $testcsvfile, "r" );

if ( !$fo->eof() )
{
	print "EOF Reached";
}

?>
--EXPECT--
EOF Reached
