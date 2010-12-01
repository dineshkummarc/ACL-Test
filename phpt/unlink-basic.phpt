--TEST--
Delete a file()
--PFTT--
filesystem=yes
populate=file,dir
--FILE--
<?php
$targets = array(
	'file'		=> 'existing_file',
	'folder'	=> 'existing_folder',
	'missing'	=> 'not_here',
);
foreach( $targets as $k => $target ) {
	echo $k . "\n";
	$testFile=___FILESDIR___. DIRECTORY_SEPARATOR. $target ;
	echo '  exists: '; var_dump(file_exists($testFile));
	echo '  unlink output: '; var_dump(@unlink($testFile));
	echo '  exists: '; var_dump(file_exists($testFile));
}
?>
--EXPECT--
file
  exists: bool(true)
  unlink output: bool(true)
  exists: bool(false)
folder
  exists: bool(true)
  unlink output: bool(false)
  exists: bool(true)
missing
  exists: bool(false)
  unlink output: bool(false)
  exists: bool(false)
