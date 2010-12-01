--TEST--
Testing SplFileObject::seek().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Seek to the specified line.
--FILE--
<?php

$file = ___FILESDIR___ . "\\file.csv";

$fo = new SplFileObject( $file );

$seekTargets = array(
	2,
	0,
	3,
);
foreach( $seekTargets as $seek ) {
	$fo->seek( $seek );
	echo 'key: '; var_dump( $fo->key() );
	echo 'contents: '; var_export( $fo->current() );
	echo "\n";
}

?>
--EXPECT--
key: int(2)
contents: '2,2,2
'
key: int(0)
contents: 'a,b,c,d
'
key: int(3)
contents: '3,3,3
'
