--TEST--
copy()
--DESCRIPTION--
A simple test of the copy() function on a file.
@uses file_exists()
--CREDITS--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=file,dir
--FILE--
<?php
// targets
$targets = array(
	'file'		=> 'existing_file',
	'folder'	=> 'existing_folder',
	'missing'	=> 'not_here',
);
// Iterate and test
foreach( $targets as $k => $target ) {
	echo $k . "\n";
	$src_path = ___FILESDIR___ . DIRECTORY_SEPARATOR . $target;
	$dest_path = ___FILESDIR___ . DIRECTORY_SEPARATOR . "moved_" . $target;
	echo "  source exists: "; var_dump( file_exists( $src_path ) ); 
	echo "  rename output: "; var_dump( @rename( $src_path , $dest_path ) );
	echo "  source exists: "; var_dump( file_exists( $src_path ) ); 
	echo "  dest exists:   "; var_dump( file_exists( $dest_path ) ); 
}
?>
--EXPECT--
file
  source exists: bool(true)
  rename output: bool(true)
  source exists: bool(false)
  dest exists:   bool(true)
folder
  source exists: bool(true)
  rename output: bool(true)
  source exists: bool(false)
  dest exists:   bool(true)
missing
  source exists: bool(false)
  rename output: bool(false)
  source exists: bool(false)
  dest exists:   bool(false)
