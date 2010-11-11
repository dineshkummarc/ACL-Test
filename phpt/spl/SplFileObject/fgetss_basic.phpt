--TEST--
Testing SplFileObject::fgetss().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
--DESCRIPTION--
Gets a line from a file and strips HTML tags.
--FILE--
<?php

/* PFTT existing_text_file.txt constant not used because it doesn't contain HTML tags.  --Kris */
$str = <<<EOD
<html><body>
 <p>Welcome! Today is the <?php print date( "jS" ); ?> of <? date( "F" ); ?>.</p>
</body></html>
Text outside of the HTML block.
EOD;

$file = ___FILESDIR___ . "\\testfilemanual.txt";

file_put_contents( $file, $str );

$file = new SplFileObject($file);

$i = 0;
while ( !$file->eof() && $i++ < 100 )
{
    print $file->fgetss();
}

?> 
--EXPECT--
Welcome! Today is the  of .

Text outside of the HTML block.
