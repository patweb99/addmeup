var debug		= require('debug'),
	async 		= require('async'),
	http		= require('http'),
	Producer	= require('./libs/addmeup/services/Producer'),
	uuid		= require('node-uuid'),
	PORT		= process.env.PORT || 3000;

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
	return producer.create( 0, 9, function( error, message ) {
		return makeRequest( message, callback );
	});
}

function makeRequest( message, callback ){

	// log details
	debug( 'prod' )( 'SENDING TO CONSUMER:\n', message );
	
	// options for making the POST request
	var options = {
		host: 'localhost',
		path: '/',
		port: PORT,
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
	req.write( JSON.stringify( message ) )
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
}, 1000);