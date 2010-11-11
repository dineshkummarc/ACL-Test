--TEST--
rename() 
--DESCRIPTION--
Tests the renaming of a directory
--CREDIT--
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--FILE--
<?php
$src_path = ___FILESDIR___ . DIRECTORY_SEPARATOR . "existing_folder";
$dest_path = ___FILESDIR___ . DIRECTORY_SEPARATOR . "moved_folder";
var_dump( rename( $src_path , $dest_path ) ); 
var_dump( file_exists( $src_path ) ); 
var_dump( file_exists( $dest_path ) ); 
?>
--EXPECTF--	
bool(true)
bool(false)
bool(true)
