--TEST--
File Functions (fopen,fwrite)
--FILE--
<?php
$data = <<<EOD
test test test test test test test
EOD;
$name = ___FILESDIR___."filename";
$fp = fopen($name, "w");
fwrite($fp, $data);
fclose($fp);
echo file_get_contents($name);
?>
--EXPECT--
test test test test test test test