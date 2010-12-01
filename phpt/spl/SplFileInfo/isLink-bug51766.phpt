--TEST--
Testing SplFileInfo::isFile().
--DESCRIPTION--
Check to see if a filesystem object is a file.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=true
populate=file,dir
link=symbolic
--FILE--
<?php
// targets
$targets = array(
       'file'       => 'existing_file',
       'folder'     => 'existing_folder',
       'fileLink'   => 'symbolic'.DIRECTORY_SEPARATOR.'existing_file',
       'folderLink' => 'symbolic'.DIRECTORY_SEPARATOR.'existing_folder',
);
// Iterate and test
foreach( $targets as $k => $target ) {
	echo $k . ': ';
	$fileinfo = new SplFileInfo( ___FILESDIR___ . DIRECTORY_SEPARATOR . $target );
	var_dump( $fileinfo->isLink() );
}
?>
--EXPECT--
file: bool(false)
folder: bool(false)
fileLink: bool(true)
folderLink: bool(true)