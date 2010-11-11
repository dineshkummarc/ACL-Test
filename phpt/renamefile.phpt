--TEST--
Rename a file() 
--FILE--
<?php
$newname=___FILESDIR___. DIRECTORY_SEPARATOR .'newname';
$testFile=___FILESDIR___. DIRECTORY_SEPARATOR .'existing_file';
var_dump(rename($testFile, $newname)); 
var_dump(file_exists($newname));  
var_dump(file_exists($testFile));
?>
--EXPECT--	
bool(true)
bool(true)
bool(false)