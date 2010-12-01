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

$i=0;
while( !$fo->eof() ){
	$fo->fgets();
	$i++;
	if($i>100) {
		die('EOF not reached. Hit loop limit.');
	}
}
print "EOF Reached";
?>
--EXPECT--
EOF Reached
