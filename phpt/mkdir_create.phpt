--TEST--
mkdir() 
--FILE--
<?php
var_dump(@mkdir(___FILESDIR___. DIRECTORY_SEPARATOR ."folder",0777,true));
?>
--EXPECT--
bool(true)