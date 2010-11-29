--TEST--
rmdir() 
--PFTT--
filesystem=yes
populate=dir,file
--FILE--
<?php
// targets
$targets = array(
	'empty'			=> 'existing_folder' . DIRECTORY_SEPARATOR . 'existing_folder',
	'full'			=> 'existing_folder',
	'notafolder'	=> 'existing_file',
	'missing'		=> 'not_here',
);
// Iterate and test
foreach( $targets as $k => $target ) {
	$targetPath = ___FILESDIR___ . DIRECTORY_SEPARATOR . $target;
	echo $k . "\n";
	echo "  does exist:   ";var_dump( file_exists( $targetPath ) );
	echo "  rmdir output: ";var_dump( @rmdir( $targetPath ) );
	echo "  still exists: ";var_dump( file_exists( $targetPath ) );
}
?>
--EXPECT--
empty
  does exist:   bool(true)
  rmdir output: bool(true)
  still exists: bool(false)
full
  does exist:   bool(true)
  rmdir output: bool(false)
  still exists: bool(true)
notafolder
  does exist:   bool(true)
  rmdir output: bool(false)
  still exists: bool(true)
missing
  does exist:   bool(false)
  rmdir output: bool(false)
  still exists: bool(false)