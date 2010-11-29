--TEST--
Rename a file() 
--FILE--
--CREDIT--
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=file
--FILE--
<?php
$src_path = ___FILESDIR___ . DIRECTORY_SEPARATOR . "existing_file";
$dest_path = ___FILESDIR___ . DIRECTORY_SEPARATOR . "moved_file";
echo "rename output: "; var_dump( rename( $src_path , $dest_path ) ); 
echo "source exists: "; var_dump( file_exists( $src_path ) ); 
echo "dest exists:   "; var_dump( file_exists( $dest_path ) ); 
?>
--EXPECTF--	
rename output: bool(true)
source exists: bool(false)
dest exists:   bool(true)
