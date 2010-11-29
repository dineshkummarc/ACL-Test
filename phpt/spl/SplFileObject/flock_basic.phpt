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

if ( $file->flock( LOCK_EX ) )
{
	// do an exclusive lock
	print "LOCKED";
	
	// release the lock    
	$file->flock( LOCK_UN );
}
else
{
	print "Couldn't get the lock!";
}
	
?>
--EXPECT--
LOCKED
