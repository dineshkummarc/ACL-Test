--TEST--
Testing SplFileInfo::getRealPath().
--DESCRIPTION--
Retrieve the absolute path to a file.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=file
--FILE--
<?php

$testfile = ___FILESDIR___ . "\\existing_file";

$testfile2 = ___FILESDIR___;
for ( $dumbloop = 1; $dumbloop <= 100; $dumbloop++ )
{
	$testfile2 .= "." . chr(92);
}
$testfile2 .= "existing_file";

$fileinfo = new SplFileInfo( $testfile );

print $testfile . "\r\n" . $fileinfo->getRealPath() . "\r\n";

$fileinfo = new SplFileInfo( $testfile2 );

print $fileinfo->getRealPath();

?>
--EXPECT--
___FILESDIR___\existing_file
___FILESDIR___\existing_file
___FILESDIR___\existing_file
