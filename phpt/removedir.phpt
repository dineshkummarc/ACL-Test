--TEST--
rmdir() 
--FILE--
<?php
var_dump(@mkdir(___FILESDIR___. DIRECTORY_SEPARATOR ."folder",0777,true));
var_dump(@rmdir(___FILESDIR___. DIRECTORY_SEPARATOR ."folder"));
?>
--EXPECT--	
bool(true)
bool(true)