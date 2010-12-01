--TEST--
Testing SplFileInfo::getGroup().
--DESCRIPTION--
Check to see what group a file belongs to.
@uses fopen()
@uses fputs()
@uses fclose()
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
--FILE--
<?php

/* We need to create two files so that we can determine that they belong to the same group.  --Kris */

/* If you're not using PFTT, change this to whatever you wish and uncomment below.  --Kris  */
$testfile1 = ___FILESDIR___ . "\\testfile1";
$testfile2 = ___FILESDIR___ . "\\testfile2";

/* Create the test files with static contents.  --Kris */
$filecontents = "This is a test file.  This file should be used with SplFileInfo.  Use it at your own risk.  There is no lifeguard on duty.  Batteries not included.  So there.";

$handle = fopen( $testfile1, "w" );
fputs( $handle, $filecontents );
fclose( $handle );

$filecontents = "And this is another test file with different contents.";

$handle = fopen( $testfile2, "w" );
fputs( $handle, $filecontents );
fclose( $handle );

/* Do the test and output the results.  --Kris */
$fileinfo1 = new SplFileInfo( $testfile1 );
$fileinfo2 = new SplFileInfo( $testfile2 );
echo 'Group Numeric: ';
var_dump( is_numeric( $fileinfo1->getGroup() ) );
echo 'Group Match:   ';
var_dump( $fileinfo1->getGroup() == $fileinfo2->getGroup() );

/* Cleanup.  --Kris */
unlink( $testfile1 );
unlink( $testfile2 );

?>
--EXPECT--
Group Numeric: bool(true)
Group Match:   bool(true)
