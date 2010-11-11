--TEST--
is_*() and file_exists() For a File.
--FILE--
<?php

$funcs = array(
	'is_writable',
	'is_readable',
	'is_executable',
	'is_file',
	'file_exists',
);

$filename = ___FILESDIR___. DIRECTORY_SEPARATOR ."filename";

foreach ($funcs as $test) {
	$bb = $test($filename);
	//echo gettype($bb)."\n";
	var_dump($bb);
	clearstatcache();
}
?>
--EXPECT--
bool(false)
bool(false)
bool(false)
bool(false)
bool(false)
