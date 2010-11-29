--TEST--
is_dir()
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
	var_dump( @is_dir( ___FILESDIR___ . DIRECTORY_SEPARATOR . $target ) );
}
--EXPECT--
file: bool(false)
folder: bool(true)
executable: bool(false)
txt: bool(false)
missing: bool(false)
