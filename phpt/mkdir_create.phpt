--TEST--
mkdir() 
--CREDITS--
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
--FILE--
<?php
$newFolder = ___FILESDIR___ . DIRECTORY_SEPARATOR ."new_folder";
echo 'folder exists: '; var_dump( file_exists( $newFolder ) );
echo 'mkdir output: '; var_dump( @mkdir( $newFolder, 0777, true ) );
echo 'folder exists: '; var_dump( file_exists( $newFolder ) );
?>
--EXPECT--
folder exists: bool(false)
mkdir output: bool(true)
folder exists: bool(true)