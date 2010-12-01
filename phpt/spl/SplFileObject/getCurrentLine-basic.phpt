--TEST--
Testing SplFileObject::getCurrentLine().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Alias of SplFileObject::fgets()
--FILE--
<?php

$file = ___FILESDIR___ . "\\file.csv";
$fo = new SplFileObject( $file );


$i=0;
while( !$fo->eof() && $i++ < 100 ){
	print $fo->getCurrentLine();
	print ":\n"; // to show that we're not just getting it all at once
}

?>
--EXPECT--
a,b,c,d
:
1,1,1
:
2,2,2
:
3,3,3
:
4,4,4:
