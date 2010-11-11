--TEST--
Testing SplFileObject::ftell().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Return current file position.
--FILE--
<?php

/* Not using PFTT constants because it's length-specific.  --Kris */
$list = array ( 
	"a,b,c,d",
	"x,y,z"
);

$file = ___FILESDIR___ . "\\testfilemanual.csv";

$fp = fopen( $file, "w" );

foreach ( $list as $line )
{
	fputcsv( $fp, explode( ",", $line ) );
}
fclose( $fp );

$fo = new SplFileObject( $file );

$data = $fo->fgets();
$lineno = $fo->ftell();

print $lineno;

?>
--EXPECT--
8
