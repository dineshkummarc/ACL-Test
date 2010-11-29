--TEST--
file_get_contents()
--CREDITS--
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=txt
--FILE--
<?php
$name = ___FILESDIR___ . DIRECTORY_SEPARATOR . "file.txt";
var_dump( file_get_contents( $name ) );
?>
--EXPECT--
string(15) "Created By PFTT"