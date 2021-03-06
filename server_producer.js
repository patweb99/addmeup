var debug			= require('debug'),
	async 			= require('async'),
	http			= require('http'),
	Producer		= require('./libs/addmeup/services/Producer'),
	uuid			= require('node-uuid'),
	Agent 			= require('agentkeepalive'),
	CONSUMER_PORT	= process.env.CONSUMER_PORT || 3000,
	PRODUCER_PORT 	= process.env.PRODUCER_PORT || 4000;

// create producers
// we are hardcoding 2 producers for now as that's all that's required.
// This can be a more dynamic process if necessary, such as using a factory
producer_arr = [
	new Producer(),
	new Producer()
]

function triggerProducers(callback){
	async.map( producer_arr, iterator, callback );
}

function iterator( producer, callback ){
	// NOTE: Add operators array argument to assist with building random expressions
	return producer.create( 1, 2000, ["+","-","/","*"], function( error, message ) {
		return makeRequest( message, callback );
	});
}

/** 
 * The makeRequest function is in charge of handling requests 
 * from the consumer 
 * @param {string} body - JSON body (message) from producer
 * @param {function} callback - Callback
 */
function makeRequest( body, callback ){

	// log details
	debug( 'prod' )( 'SENDING TO CONSUMER:\n', body );
	
	// options for making the POST request
	var options = {
		host: 'localhost',
		path: '/',
		port: CONSUMER_PORT,
		method: 'POST' 
	};

	// create callback
	callback = function(response) {
		var str = ''
		response.on('data', function (chunk) {
			str += chunk;
		});

		response.on('end', function () {
			// process response
			debug( 'prod' )( 'CONSUMER RESPONSE:\n' + str );
			
		});
	}

	// attempt to make request
	var req = http.request(options, callback);
	req.on( 'error', function( error ) {
		debug( 'prod' )( 'An error has occurredL', error )
	});
	req.write( JSON.stringify( body ) )
	req.end()

}

// start sending consumable data
setInterval( function() {
	triggerProducers( function( error, result ) {
		
		// handle any error
		if ( error ) {
			debug( 'dev' )( 'An error occurred within a producer', error );
			return
		}

		// log that the producer produced something
		debug( 'dev' )( 'Produced:', result );
	});
}, 10);

/** 
 * Handler to receive incoming messages from Consumer
 * @param {object} request - Request object
 * @param {object} response - Response object
 */
 recieve_message_handler = function( request, response ) {
	// only process POST requests
	if ( request.method == 'POST' ) {

		var body = '';
		// start receiving data
		request.on('data', function (data) {
			body += data;
		});
		// done receiving data
		request.on('end', function () {
			var message = JSON.parse( body );
			debug( 'prod' )( "MESSAGE FROM CONSUMER:", JSON.parse( body ) );
			response.end()
		});
	}
}

http.createServer( recieve_message_handler ).listen( PRODUCER_PORT, function() {
	debug( 'prod' )( 'Consumer running on port %d', PRODUCER_PORT );
});