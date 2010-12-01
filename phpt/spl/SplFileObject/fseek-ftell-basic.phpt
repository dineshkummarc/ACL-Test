--TEST--
Testing SplFileObject::fseek().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=csv
--DESCRIPTION--
Seek to a position.
--FILE--
<?php

$file = ___FILESDIR___ . "\\file.csv";

$whences = array(
	'SEEK_SET',
	'SEEK_CUR',
	'SEEK_END',
);

$seekpoints = array(
	2,
	0,
	4,
	5,
	-3
);

$fo = new SplFileObject( $file );
foreach( $whences as $whence ){
	echo $whence . "\n";
	foreach( $seekpoints as $sp ) {
		echo '  seek '.$sp."\n";
		if( ($whence == 'SEEK_SET') && ($sp < 0) ) { echo '    // Cannot seek past beginning'."\n"; }
		echo '    fseek output: '; var_dump( $fo->fseek( $sp, constant( $whence ) ) );
		echo '    ftell output: '; var_dump( $fo->ftell() );
	}
	$fo->rewind();
}
?>
--EXPECT--
SEEK_SET
  seek 2
    fseek output: int(0)
    ftell output: int(2)
  seek 0
    fseek output: int(0)
    ftell output: int(0)
  seek 4
    fseek output: int(0)
    ftell output: int(4)
  seek 5
    fseek output: int(0)
    ftell output: int(5)
  seek -3
    // Cannot seek past beginning
    fseek output: int(-1)
    ftell output: int(5)
SEEK_CUR
  seek 2
    fseek output: int(0)
    ftell output: int(2)
  seek 0
    fseek output: int(0)
    ftell output: int(2)
  seek 4
    fseek output: int(0)
    ftell output: int(6)
  seek 5
    fseek output: int(0)
    ftell output: int(11)
  seek -3
    fseek output: int(0)
    ftell output: int(8)
SEEK_END
  seek 2
    fseek output: int(0)
    ftell output: int(37)
  seek 0
    fseek output: int(0)
    ftell output: int(35)
  seek 4
    fseek output: int(0)
    ftell output: int(39)
  seek 5
    fseek output: int(0)
    ftell output: int(40)
  seek -3
    fseek output: int(0)
    ftell output: int(32)
