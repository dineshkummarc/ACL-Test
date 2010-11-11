--TEST--
Testing SplFileObject::fscanf.
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Fscanf() - Testing for %d recognition bug.
--FILE--
<?php

$list = array (
     1,2,3,4,
    "1,1,1",
    "2,2,2",
	"3,3,3",
);

$file = ___FILESDIR___ . "\\testfilemanual.csv";
$fp = fopen( $file, "w" );

foreach ( $list as $line )
{
	fputcsv( $fp, explode( ",", $line ) );
}

fclose( $fp );

$fo = new SplFileObject( $file );
var_dump( $fo->fscanf( "%d" ) );

?>
--EXPECT--
array(1) {
  [0]=>
  string(1) "1"
}
