--TEST--
Testing SplFileObject::getFilename().
--CREDITS--
Suman Madavapeddi <v-sumada@microsoft.com>
Kris Craig <a-krcrai@microsoft.com>
Ryan Biesemeyer <v-ryanbi@microsoft.com>
--PFTT--
filesystem=yes
populate=all
--DESCRIPTION--
SplFileObject::getFilename() which is inherited from SplFileInfo::getFileName().
--FILE--
<?php

$targets = array(
	'file' =>	'existing_file',
	'txt' =>	'file.txt',
	'csv' =>	'file.csv',
	'exe' =>	'existential.exe',
	'dir' =>	'existing_folder',
	'missing' =>	'not_here',
);

foreach( $targets as $k => $target ) {
	echo $k . ': ';
	try {
		$fo = new SplFileObject( ___FILESDIR___ . DIRECTORY_SEPARATOR . $target );
		var_dump( $fo->getFilename() );
	} catch ( RuntimeException $e ) {
		echo $e->getMessage()."\n";
	}
}

?>
--EXPECT--
file: string(13) "existing_file"
txt: string(8) "file.txt"
csv: string(8) "file.csv"
exe: string(15) "existential.exe"
dir: SplFileObject::__construct(___FILESDIR___\existing_folder): failed to open stream: Permission denied
missing: SplFileObject::__construct(___FILESDIR___\not_here): failed to open stream: No such file or directory
