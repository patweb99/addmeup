var debug 	= require('debug'),
	async 	= require('async'),
	_self_;

/** 
 * Consumer handles receiving an expression and evaluating it
 * @constructor
 */
function Consumer() {
	_self_ = this;
	_self_.queue = async.queue(this.run,10);
	_self_.queue.drain = _self_.drain;
}

/** 
 * Handles running the expression by pulling it out of the message
 * @param {string} message - Message represented by JSON which cotains th expression
 * @param {function} callback - Callback
 * @returns {async}
 */
Consumer.prototype.run = function( message, callback ) {

	// get producer id
	producer_id = message.producer_id;
	// get expression
	expression = message.expression;
	// break out the expression into an array of elements
	expression_to_arr = expression.split('');
	
	// separate out the expression attributes
	var int1 		= expression_to_arr[0],
		operator 	= expression_to_arr[1],
		int2 		= expression_to_arr[2];

	// wrap up the results
	message['equals'] = _self_.evaluate_expression( int1, operator, int2 );

	// generate the results to send back (simple string)
	debug('debug')( "Expression processed by Consumer", message )

	return async.ensureAsync( callback( null, message ) );
}

/**
 * Evaluates the expression passed
 * @param {Number} - Integer 1 passed as part of the expression
 * @param {operator} - Operator used to handle expression
 * @param {Number} - Integer 2 passed as part of the expression
 * @returns {Number}
 */ 
Consumer.prototype.evaluate_expression = function( int1, operator, int2 ) {
	return eval( int1 + operator + int2 );
}

/**
 * Used to push a message into the queue for processing
 * @param {string} message - Message represented by JSON which cotains th expression
 * @param {function} callback - Callback
 */
Consumer.prototype.push = function( message, callback ) {
	debug( 'debug' )( "Pushing item into queue: ", message );
	// push the message into the queue
	return _self_.queue.push( message, callback );
}

/**
 * Drain method to use in conjunction with async queue
 */
Consumer.prototype.drain = function() {
	if ( _self_.queue.length() == 0 ) {
		debug( 'prod' )( "The queue is now empty" );
	}
}

module.exports = new Consumer();