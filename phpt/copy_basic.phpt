--TEST--
Copy a file.
--DESCRIPTION--
A simple test of the copy() function on a file.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=file
--FILE--
<?php

/* Set the file vars.  --Kris */
$srcfilename = ___FILESDIR___ . DIRECTORY_SEPARATOR . "existing_file";
$dstfilename = ___FILESDIR___ . DIRECTORY_SEPARATOR . "copied_file";

/* Copy the file.  --Kris */
$copyok = copy( $srcfilename, $dstfilename );

/* Output results.  --Kris */
echo 'copy output: '; var_dump( $copyok );
echo 'source exists: '; var_dump( file_exists( $srcfilename ) );
echo 'dest exists: '; var_dump( file_exists( $dstfilename ) );

?>
--EXPECT--
copy output: bool(true)
source exists: bool(true)
dest exists: bool(true)
