--TEST--
mkdir() 
--CREDITS--
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=dir
--FILE--
<?php
// targets
$targets = array(
	'new'		=> 'new_folder',
	'existing'	=> 'existing_folder',
);
// Iterate and test
foreach( $targets as $k => $target ) {
	echo $k . "\n";
	$newFolder = ___FILESDIR___ . DIRECTORY_SEPARATOR . $target;
	echo '  folder exists: '; var_dump( file_exists( $newFolder ) );
	echo '  mkdir output: '; var_dump( @mkdir( $newFolder, 0777, true ) );
	echo '  folder exists: '; var_dump( file_exists( $newFolder ) );
}
?>
--EXPECT--
new
  folder exists: bool(false)
  mkdir output: bool(true)
  folder exists: bool(true)
existing
  folder exists: bool(true)
  mkdir output: bool(false)
  folder exists: bool(true)