--TEST--
is_file()
--CREDITS--
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=all
--FILE--
<?php
// targets
$targets = array(
	'file'			=> 'existing_file',
	'folder'		=> 'existing_folder',
	'executable'	=> 'existential.exe',
	'txt'			=> 'file.txt',
	'missing'		=> 'not_here',
);
// Iterate and test
foreach( $targets as $k => $target ) {
	echo $k . ': ';
	var_dump( @is_file( ___FILESDIR___ . DIRECTORY_SEPARATOR . $target ) );
}
--EXPECT--
file: bool(true)
folder: bool(false)
executable: bool(true)
txt: bool(true)
missing: bool(false)
