--TEST--
rename() 
--DESCRIPTION--
Tests the renaming of a directory
--CREDIT--
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=dir
--FILE--
<?php
$src_path = ___FILESDIR___ . DIRECTORY_SEPARATOR . "existing_folder";
$dest_path = ___FILESDIR___ . DIRECTORY_SEPARATOR . "moved_folder";
echo "rename output: "; var_dump( rename( $src_path , $dest_path ) ); 
echo "source exists: "; var_dump( file_exists( $src_path ) ); 
echo "dest exists:   "; var_dump( file_exists( $dest_path ) ); 
?>
--EXPECTF--	
rename output: bool(true)
source exists: bool(false)
dest exists:   bool(true)
