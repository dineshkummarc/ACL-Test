--TEST--
Testing SplFileObject::fscanf().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Parses input from a file according to a format.
--FILE--
<?php

$file = ___FILESDIR___ . "\\file.csv";

$formats = array(
	'%s',			// string
	'%x,%x,%x,%x',  // four hex values ( a:d -> 10:13 )
);

foreach( $formats as $format ) {
	echo '== '.$format.' =='."\n";
	$fo = new SplFileObject($file);
	var_dump( $fo->fscanf( $format ) );
}


?>
--EXPECT--
== %s ==
array(1) {
  [0]=>
  string(7) "a,b,c,d"
}
== %x,%x,%x,%x ==
array(4) {
  [0]=>
  int(10)
  [1]=>
  int(11)
  [2]=>
  int(12)
  [3]=>
  int(13)
}