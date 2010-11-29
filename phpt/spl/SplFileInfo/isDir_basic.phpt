--TEST--
Testing SplFileInfo::isDir().
--DESCRIPTION--
Check to see if a filesystem object is a directory.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=dir,file
--FILE--
<?php

/* This can be changed to whatever you wish.  */
$targets = array(
	'file'		=> 'existing_file',
	'folder'	=> 'existing_folder',
	'missing'	=> 'not_here',
);

/* Do the test and output the results.  --Kris */
foreach( $targets as $k => $target ) {
	echo $k . ' : ';
	$fileinfo = new SplFileInfo( ___FILESDIR___ . DIRECTORY_SEPARATOR . $target );
	var_dump( $fileinfo->isDir() );
}

?>
--EXPECT--
file : bool(false)
folder : bool(true)
missing : bool(false)
