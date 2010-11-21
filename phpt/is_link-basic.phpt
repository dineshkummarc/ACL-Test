--TEST--
is_link()
--CREDITS--
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
       'fileLink'   => 'symbolic' . DIRECTORY_SEPARATOR . 'existing_file',
       'folderLink' => 'symbolic' . DIRECTORY_SEPARATOR . 'existing_folder',
);
// Iterate and test
foreach( $targets as $k => $target ) {
       echo $k . ' : ';
       var_dump( is_link( ___FILESDIR___ . DIRECTORY_SEPARATOR . $target ) );
}
?>
--EXPECT--
file : bool(false)
folder : bool(false)
fileLink : bool(true)
folderLink : bool(true)
