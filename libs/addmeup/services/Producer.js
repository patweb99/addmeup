var dev 	= require('debug')('dev'),
	async 	= require('async'),
	uuid	= require('node-uuid');


function Producer( name ) {
	
	if (typeof name === 'undefined') {
		name = uuid.v1()
	}

	dev( "Producer Created with name: " + name )
	this.name = name;
}

Producer.prototype.create = function( max_pos, min_pos, callback ) {

	// create int's to be used within expression
	int1 = Math.floor( Math.random() * ( max_pos - min_pos ) + min_pos );
	int2 = Math.floor( Math.random() * ( max_pos - min_pos ) + min_pos );

	// create expression object
	out = {
		expression: int1 + "+" + int2 + "=",
		producer_id: this.name
	}

	// return the expression
	return async.ensureAsync( callback( null, out ) );
}

// constructor
module.exports = Producer;