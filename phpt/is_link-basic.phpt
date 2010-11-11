--TEST--
is_link()
--CREDITS--
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--FILE--
<?php
// targets
$targets = array(
       'file'       => 'existing_file',
       'folder'     => 'existing_folder',
       'fileLink'   => 'symlink_to_existing_file',
       'folderLink' => 'symlink_to_existing_folder',
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
