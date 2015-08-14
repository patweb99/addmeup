var debug 	= require('debug'),
	async 	= require('async'),
	_self_;

function Consumer() {
	_self_ = this;
	_self_.queue = async.queue(this.run,10);
	_self_.queue.drain = _self_.drain;
}

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

Consumer.prototype.evaluate_expression = function( int1, operator, int2 ) {
	return eval( int1 + operator + int2 );
}

Consumer.prototype.push = function( message, callback ) {
	debug( 'debug' )( "Pushing item into queue: ", message );
	// push the message into the queue
	return _self_.queue.push( message, callback );
}

Consumer.prototype.drain = function() {
	if ( _self_.queue.length() == 0 ) {
		debug( 'debug' )( "The queue is now empty" );
	}
}

// constructor
module.exports = new Consumer();