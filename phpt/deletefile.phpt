--TEST--
Delete a file() 
--FILE--
<?php
$testFile=___FILESDIR___."filename";
$readData="Writing Some Test Text !";
$fh = fopen($testFile, 'w');
      fwrite($fh, $readData);
      fclose($fh);
var_dump(file_exists($testFile));
var_dump(unlink($testFile));
?>
--EXPECT--	
bool(true)
bool(true)
