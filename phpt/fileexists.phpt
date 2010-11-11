--TEST--
Test For Existence of file 
--FILE--
<?php
$data = <<<EOD
test test test test test test test
EOD;
$name = ___FILESDIR___."filename";
$fp = fopen($name, "w");
fwrite($fp, $data);
fclose($fp);
var_dump(file_exists($name));
var_dump(is_file($name));
?>
--EXPECT--
bool(true)
bool(true)