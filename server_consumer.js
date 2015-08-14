var debug			= require('debug'),
	http			= require('http'),
	Consumer 		= require('./libs/addmeup/services/Consumer'),
	port 			= process.argv[2] || 3000;

// handler to receive incoming messages from Generator
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
				Consumer.push( JSON.parse( body ), function( error, results ) {
					// if there is an error then we throw a status 500
					if ( error ) {
						debug('prod')( 'An error has occurred', error );
						error.status = 500;
						next( error );
					} else {
						debug( 'prod' )( 'SENDING TO PRODUCER:\n', results )
						response.end( JSON.stringify( results ) );
					}
				});
			} catch ( e ) {
				debug( 'prod' )( 'An error occurred:', e )
			}
		});
	}
}

// start the web server
http.createServer( recieve_message_handler ).listen( port, function() {
	debug( 'prod' )( 'Consumer running on port %d', port );
});