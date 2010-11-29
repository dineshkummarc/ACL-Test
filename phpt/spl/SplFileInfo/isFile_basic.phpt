--TEST--
Testing SplFileInfo::isFile().
--DESCRIPTION--
Check to see if a filesystem object is a file.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=file,exe,dir
--FILE--
<?php

/* This can be changed to whatever you wish.  */
$targets = array(
	'file'		=> 'existing_file',
	'exe'		=> 'existential.exe',
	'folder'	=> 'existing_folder',
	'missing'	=> 'not_here',
);

/* Do the test and output the results.  --Kris */
foreach( $targets as $k => $target ) {
	echo $k . ' : ';
	$fileinfo = new SplFileInfo( ___FILESDIR___ . DIRECTORY_SEPARATOR . $target );
	var_dump( $fileinfo->isFile() );
}

?>
--EXPECT--
file : bool(true)
exe : bool(true)
folder : bool(false)
missing : bool(false)
