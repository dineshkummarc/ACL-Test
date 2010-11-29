--TEST--
Testing SplFileInfo::setFileClass().
--DESCRIPTION--
Sets the class name used with openFile().
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=all
--FILE--
<?php

$testfile = ___FILESDIR___ . "\\existing_file";

/* Create the test file with static contents.  --Kris */
$filecontents = "This is a test file.  This file should be used with SplFileInfo.  Use it at your own risk.  There is no lifeguard on duty.  Batteries not included.  So there.";

$handle = fopen( $testfile, "w" );
fputs( $handle, $filecontents );
fclose( $handle );

/* Create the class.  --Kris */
class MyFile extends SplFileObject {}

/* Do the test and output the results.  --Kris */
$fileinfo = new SplFileInfo( $testfile );

$fileinfo->setFileClass( "MyFile" );

$fileobj = $fileinfo->openFile( "r" );

$rcontents = NULL;
while ( !$fileobj->eof() )
{
	$rcontents .= $fileobj->fgets();
}

print $rcontents . "\r\n" . $filecontents;

?>
--EXPECT--
This is a test file.  This file should be used with SplFileInfo.  Use it at your own risk.  There is no lifeguard on duty.  Batteries not included.  So there.
This is a test file.  This file should be used with SplFileInfo.  Use it at your own risk.  There is no lifeguard on duty.  Batteries not included.  So there.
