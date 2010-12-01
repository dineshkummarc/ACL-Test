--TEST--
Testing SplFileObject::flock().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=all
--DESCRIPTION--
Portable file locking.
--FILE--
<?php
$file = ___FILESDIR___ . "\\existing_file";

$file = new SplFileObject( $file, "w+" );

echo 'Locked: '; var_dump( $file->flock( LOCK_EX ) );
echo 'Unlocked: '; var_dump( $file->flock( LOCK_UN ) );

?>
--EXPECT--
Locked: bool(true)
Unlocked: bool(true)
