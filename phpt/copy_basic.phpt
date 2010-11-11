--TEST--
Copy a file.
--DESCRIPTION--
A simple test of the copy() function on a file.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
--FILE--
<?php

/* Set the file vars.  --Kris */
$srcfilename = ___FILESDIR___ . DIRECTORY_SEPARATOR . "existing_file";
$dstfilename = ___FILESDIR___ . DIRECTORY_SEPARATOR . "file_destination";

/* Copy the file.  --Kris */
$copyok = copy( $srcfilename, $dstfilename );

/* Output results.  --Kris */
var_dump( $copyok );
var_dump( file_exists( $srcfilename ) );
var_dump( file_exists( $dstfilename ) );

?>
--EXPECT--
bool(true)
bool(true)
bool(true)
