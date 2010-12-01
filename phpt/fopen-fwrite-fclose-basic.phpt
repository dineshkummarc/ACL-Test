--TEST--
Create a file()
--CREDITS--
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
--FILE--
<?php
$testFile=___FILESDIR___ . DIRECTORY_SEPARATOR . "filename";
$readData="Writing Some Test Text !";
$fh = fopen($testFile, 'w');
      fwrite($fh, $readData);
      fclose($fh);
echo 'file exists: '; var_dump(file_exists($testFile));
?>
--EXPECT--
file exists: bool(true)
