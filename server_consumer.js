var debug			= require('debug'),
	async 			= require('async'),
	http			= require('http'),
	Consumer 		= require('./libs/addmeup/services/Consumer'),
	Agent 			= require('agentkeepalive'),
	CONSUMER_PORT	= process.env.CONSUMER_PORT || 3000,
	PRODUCER_PORT 	= process.env.PRODUCER_PORT || 4000;

/** 
 * The processRequest function is in charge of handling requests 
 * from the producer 
 * @param {string} body - JSON body (message) from producer
 * @param {function} callback - Callback
 */
function processRequest( body, callback ){

	// call consumer
	async.ensureAsync( Consumer.push( body, function( error, results ) {

		// if there is an error then we throw a status 500
		if ( error ) {
			debug('prod')( 'An error has occurred', error );
			error.status = 500;
		} else {

			debug( 'prod' )( 'SENDING MESSAGE BACK TO PRODUCER: ', results )

			// MAKE POST REQUEST BACK TO PRODUCER
			// options for making the POST request
			var options = {
				host: 'localhost',
				path: '/',
				port: PRODUCER_PORT,
				method: 'POST'
			};

			// create callback
			req_callback = function(response) {
				var str = ''
				response.on('data', function (chunk) {
					str += chunk;
				});

				response.on('end', function () {
					debug('prod')('end')
					callback( null, null)
				});
			}

			// attempt to make request
			var req = http.request(options, req_callback);
			req.on( 'error', function( error ) {
				debug( 'prod' )( 'An error has occurredL', error )
			});
			req.write( JSON.stringify( body ) )
			req.end()
			
		}
	}));

}

/** 
 * Handler to receive incoming messages from Generator
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
			debug( 'prod' )( "MESSAGE FROM PRODUCER:\n", JSON.parse( body ) );

			try {
				processRequest( message, function( error, results ) {
					debug('prod')( 'REQUEST FROM PRODUCER WAS PROCESSED' )
					response.end( "" );
				})
			} catch ( e ) {
				debug( 'prod' )( 'An error occurred:', e )
			}
		});
	}
}

// start the web server
http.createServer( recieve_message_handler ).listen( CONSUMER_PORT, function() {
	debug( 'prod' )( 'Consumer running on port %d', CONSUMER_PORT );
});