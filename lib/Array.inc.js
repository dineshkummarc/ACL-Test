/**
 * Litter the Array function namespace with functions relevant to Array objects.
 * Note that we are not extenging the Array prototype, as this "breaks" for..in looping,
 * but instead adding properties to the Array object itself.
 *
 * Every function's first argument should be the array to work with. 
 * 
 * To call a function defined here, do:
 * 
 * 		Array.valueExists( arrayObject, valueToLookFor );
 */ 
Array.Extend((function(){
	/**
	 * Determine how many times an item occurs in an array.
	 */
	function valueExists( arr, val ) {
		_ensureArrayType( arr );
		var l = arr.length;
		r = 0;
		for( var i = 0; i < l; i++ ) {
			if( arr[i] === val ) { r++ };
		}
		return r;		
	};
	
	function _ensureArrayType( arr ){
		if( !( arr instanceof Array ) )
			Assert.Fail( 'Object is not an Array.' );
	}
	
	return {
		'valueExists' : valueExists
	};
})());

if( config.unitTest ) {
	(function ArrayExtensionsUnitTest () {
		( function Array_valueExists(){
			var a = [2,3,5,5,'foo','bar','bar']
			;
			Assert.Value( ( Array.valueExists( a, 1 ) == 0 ), 		'Missing integer reports present' );
			Assert.Value( ( Array.valueExists( a, 2 ) ),	 		'Present-once integer reports missing' );
			Assert.Value( ( Array.valueExists( a, 2 ) == 1 ), 		'Present-once integer reports incorrect quantity' );
			Assert.Value( ( Array.valueExists( a, 5 ) ), 			'Present-twice integer reports missing' );
			Assert.Value( ( Array.valueExists( a, 5 ) == 2 ), 		'Present-twice string reports incorrect quantity' );
			Assert.Value( ( Array.valueExists( a, 'str' ) == 0 ),	'Missing string reports present' );
			Assert.Value( ( Array.valueExists( a, 'foo' ) ),		'Present-once string reports missing' );
			Assert.Value( ( Array.valueExists( a, 'foo' ) == 1),	'Present-once string reports incorrect quantity' );
			Assert.Value( ( Array.valueExists( a, 'bar' ) ),		'Present-twice string reports missing' );
			Assert.Value( ( Array.valueExists( a, 'bar' ) == 2),	'Present-twice string reports incorrect quantity' );
			Assert.Value( ( !Object.isFunction( a.valueExists ) ), 	'function leaked into prototype');
			
			// Slightly more complex because we need to try..catch to determine if this passes/fails.
			Assert.Value( (function(){
				try {
					Array.valueExists( 'str', 'str' );
				} catch( e ) {
					if( e.message.match(/is not an Array/i)){ return true; }
				}
				return false;
			})(),'Non-array type does not properly throw error.' );
			
		})();
		
	})();
}