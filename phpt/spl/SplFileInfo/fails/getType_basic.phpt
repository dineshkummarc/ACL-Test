--TEST--
Testing SplFileInfo::getType().
--DESCRIPTION--
Retrieve the file type.
--CREDIT--
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
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
	   var_dump( $fileinfo->getType() );
}
?>
--EXPECT--
file: string(4) "file"
folder: string(3) "dir"
fileLink: string(4) "link"
folderLink: string(4) "link"