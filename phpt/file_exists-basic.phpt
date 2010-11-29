--TEST--
Test For Existence of filesystem objects
--CREDITS--
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=all
--FILE--
<?php
// targets
$targets = array(
	'file'		=> 'existing_file',
	'folder'	=> 'existing_folder',
	'txt'		=> 'file.txt',
	'missing'	=> 'not_here',
);
// Iterate and test
foreach( $targets as $k => $target ) {
	echo $k . ': ';
	var_dump( file_exists( ___FILESDIR___ . DIRECTORY_SEPARATOR . $target ) );
}
?>
--EXPECT--
file: bool(true)
folder: bool(true)
txt: bool(true)
missing: bool(false)