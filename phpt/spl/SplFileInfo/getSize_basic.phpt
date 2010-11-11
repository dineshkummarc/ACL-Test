--TEST--
Testing SplFileInfo::getSize().
--DESCRIPTION--
Get the size (in bytes) of a file.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
--FILE--
<?php

/* 
 * PFTT Note:
 * 
 * Because we're testing for an accurate file size and we don't want to 
 * involve any other sizing functions if avoidable, we'll be writing the text 
 * file manually.  This can be replaced with PFTT constants if/when 
 * we develop a constant that outputs the size (in bytes) of existing_file.
 * 
 * --Kris
 */

/* This can be changed to whatever you wish.  --Kris */
$testfile = ___FILESDIR___ . "\\testfilemanual.txt";

/* Create the test file with static contents.  If you comment this, make sure you manually set the $expectedsize variable!  --Kris */

$filecontents = "This is a test file.  This file should be used with SplFileInfo.  Use it at your own risk.  There is no lifeguard on duty.  Batteries not included.  So there.";
$expectedsize = strlen( $filecontents );

$handle = fopen( $testfile, "w" );
fputs( $handle, $filecontents );
fclose( $handle );


/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfile );
var_dump( ( $expectedsize == $fileinfo->getSize() ) );

/* Cleanup.  Comment if the file creation section is also commented.  --Kris */
unlink( $testfile );

?>
--EXPECT--
bool(true)
