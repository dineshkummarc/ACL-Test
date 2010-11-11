--TEST--
Testing SplFileInfo::getATime().
--DESCRIPTION--
Check to see when a file was last accessed.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
--FILE--
<?php

$testfile = ___FILESDIR___ . "\\existing_file";

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfile );

/* Allow +/- 5 seconds to account for CPU lag.  --Kris */
var_dump( ( $fileinfo->getATime() <= (time() + 5) || $fileinfo->getATime() >= (time() - 5) ) );

?>
--EXPECT--
bool(true)
