var Stack = Class.create({
	/**
	 * Construct a new instance of this class using the 'new' keyword
	 *
	 * @return {Stack}
	 */
	'initialize':	function(){
						this.items = [];
					},
	/**
	 * Add something to the Stack. The items should be homogeneous, as we will likely
	 * be iterating through them, but this is not enforced.
	 */
	'addItem':		function( itemToAdd ){
						this.items[this.length()] = itemToAdd;
						return this;
					},
	
	/**
	 * Add another stack to this one.
	 */
	'addStack':		function(
						stack
					){
						if( !( stack instanceof this.constructor ) ){
							throw new Error( 'stack1.addStack( stack2 ): stack2 must be an instance of stack1.constructor' );
						}
						sP = stack.newPointer();
						while( sI = stack.getNext( sP ) ) {
							this.addItem( sI );
						}
						return this;
					},
	
	/**
	 * Rudimentary search feature, returns the first item it finds that matches.
	 * @param {String} propName
	 * @param {Mixed} propName
	 *
	 * @return {Mixed} matched item from Stack
	 */
	'findItem':		function( propName, propVal ){
						for( var k in this.items ){
							if( this.items[k].propName == propVal )
								return this.items[k];
						}
					},
	
	/**
	 * Create a new pointer. This is useful if you need to iterate through the same Stack against
	 * itself.
	 * Note, if optional pointerId is passed and already exists, it will reset that pointer.
	 * @param {Integer} optional pointerId
	 * 
	 * @return {Integer} a valid pointerId
	 */
	'newPointer': 	function( pointerId ){
						if( !(this.pointers) )
							this.pointers=[];
						if(typeof(pointerId)=='undefined')
							pointerId = this.pointers.length;
						
						this.pointers[pointerId] = null;
	
						return pointerId;
					},
	
	/**
	 * Get the top pointer. If none exists, call this.newPointer()
	 * 
	 * @return {Integer} a valid pointerId
	 */
	'topPointer':	function(){
						if(!this.pointers){
							var pointerId = this.newPointer();
						} else {
							var pointerId = (this.pointers.length - 1);
						}
						return pointerId;
					},
	
	/**
	 * Get a pointer. If optional pointerId is passed, and exists, that pointer is returned.
	 * If supplied pointerId does not exist, a new pointer is created.
	 * If no pointerId is supplied, the default (o) pointer is returned.
	 * @param {Integer} optional pointerId
	 * 
	 * @return {Integer} a valid pointerId
	 */
	'getPointer':	function( pointerId ){
						if(typeof(pointerId)=='undefined'){
							if( !(this.pointers) )
								return this.newPointer();
							return 0;
						}
						if(!(pointerId in this.pointers))
							pointerId = this.newPointer(pointerId);
						return pointerId;
					},
	
	/**
	 * Get info about a pointer. Helpful for debugging, but little else.
	 * @param {Integer} optional pointerId
	 *
	 * @param {Object} An object describing the pointer. e.g.,{'id':3,'pos':17}
	 */
	'getPointerInfo':function( pointerId ) {
						pointerId = this.getPointer( pointerId );
						return {'id':pointerId,'pos':this.pointers[pointerId]};
					},
	/**
	 * Get the next item from the Stack
	 * Advances cursor before returning this.getItemByIndex(currentIndex)
	 * If no pointer is supplied, the default pointer is used
	 * @param {Integer} optional pointerId
	 * 
	 * @return {Mixed|Boolean} the next item in the Stack, Boolean false if no more items exist.
	 */
	'getNext':		function( pointerId ){
						pointerId = this.getPointer( pointerId );
						this.incrementPointer( pointerId );
						return this.getItemByIndex( this.pointers[pointerId] );
					},
	
	/**
	 * Get the previous item from the Stack
	 * Decrements cursor before returning this.getItemByIndex(currentIndex)
	 * If no pointer is supplied, the default pointer is used
	 * @param {Integer} optional pointerId
	 * 
	 * @return {Mixed|Boolean} the previous item in the Stack, Boolean false if no more items exist.
	 */
	'getPrevious':	function( pointerId ){
						pointerId = this.getPointer( pointerId );
						this.decrementPointer( pointerId );
						return this.getItemByIndex( this.pointers[pointerId] );
					},
	
	/**
	 * Get the current item from the Stack
	 * If no pointer is supplied, the default pointer is used
	 * @param {Integer} optional pointerId
	 * 
	 * @return {Mixed|Boolean} the current item in the Stack, Boolean false if no more items exist.
	 */
	'getCurrent':	function( pointerId ){
						pointerId = this.getPointer( pointerId );
						// If we're calling getCurrent and the 
						if( this.pointers[pointerId] == null)
							this.incrementPointer( pointerId );
						
						return this.getItemByIndex( this.pointers[pointerId] );
					},
	
	/**
	 * Get the current item from the Stack
	 * If no pointer is supplied, the default pointer is used
	 * @param {Integer} idx
	 * 
	 * @return {Mixed|Boolean} the item in the Stack that corresponds to the supplied index, 
	 * 							Boolean false index does not match any items.
	 */
	'getItemByIndex':function( idx ){
						if( !( idx in this.items ) )
							return false;
						return this.items[idx];
					},
	
	/**
	 * Increment the supplied pointer. 
	 * If the pointer is null or negative, set it to zero
	 * If no pointer is supplied, the default is used.
	 * @param {Integer} optional pointerId
	 * 
	 * @return {void} 
	 */
	'incrementPointer': function( pointerId ){
							pointerId = this.getPointer( pointerId );
							if( this.pointers[pointerId] < 0 || this.pointers[pointerId] == null)
								this.pointers[pointerId] = 0;
							else
								this.pointers[pointerId]++;
						},
	
	/**
	 * Decrement the supplied pointer. 
	 * If the pointer is null or negative, set it to null
	 * If no pointer is supplied, the default is used.
	 * @param {Integer} optional pointerId
	 * 
	 * @return {void} 
	 */
	'decrementPointer': function( pointerId ){
							pointerId = this.getPointer( pointerId );
							if( !this.pointers[pointerId] < 0 || this.pointers[pointerId] == null)
								this.pointers[pointerId] = null;
							else
								this.pointers[pointerId]--;
						},
	
	/**
	 * Set the supplied pointer to the 0th item and return it. 
	 * If no pointer is supplied, the default is used.
	 * @param {Integer} pointerId
	 * 
	 * @return {Mixed} the first item in the Stack 
	 */
	'getFirst':		function( pointerId ){
						pointerId = this.getPointer( pointerId );
						this.pointers[pointerId] = 0;
						return this.getItemByIndex( this.pointers[pointerId] );
					},
	
	/**
	 * Set the supplied pointer to the last item and return it. 
	 * If no pointer is supplied, the default is used.
	 * @param {Integer} pointerId
	 * 
	 * @return {Mixed} the first item in the Stack 
	 */
	'getLast':		function( pointerId ){
						var pointerId = this.getPointer( pointerId );
						this.pointers[pointerId] = ( this.length() - 1 );
						return this.getItemByIndex( this.pointers[pointerId] );
					},
	
	/**
	 * Is the current item the first (0th) one?. 
	 * If no pointer is supplied, the default is used.
	 * @param {Integer} optional pointerId
	 * 
	 * @return {Boolean}
	 */
	'isFirst':		function( pointerId ){
						pointerId = this.getPointer( pointerId );
						return ( !this.pointers[pointerId] || this.pointers[pointerId] == null );
					},
	
	/**
	 * Is the current item the last one?. 
	 * If no pointer is supplied, the default is used.
	 * @param {Integer} optional pointerId
	 * 
	 * @return {Boolean}
	 */
	'isLast':		function( pointerId ){
						pointerId = this.getPointer( pointerId );
						return ( this.pointers[pointerId] != null && this.pointers[pointerId] >= this.length() );
					},
	'length':		function() {
						return this.items.length;
					}
});