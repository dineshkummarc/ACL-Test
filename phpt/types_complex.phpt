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
       echo $k . "\n";
	   $fTarget = ___FILESDIR___ . DIRECTORY_SEPARATOR . $target;
       echo 'is_link: ';var_dump( is_link( $fTarget ) );
       echo 'is_file: ';var_dump( is_file( $fTarget ) );
       echo 'is_dir:  ';var_dump( is_dir( $fTarget ) );
	   echo "\n";
}
?>
--EXPECT--
file
is_link: bool(false)
is_file: bool(true)
is_dir:  bool(false)

folder
is_link: bool(false)
is_file: bool(false)
is_dir:  bool(true)

fileLink
is_link: bool(true)
is_file: bool(true)
is_dir:  bool(false)

folderLink
is_link: bool(true)
is_file: bool(false)
is_dir:  bool(true)
