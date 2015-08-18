var debug 	= require('debug'),
	async 	= require('async'),
	uuid	= require('node-uuid');

/** 
 * Producer handles generating an expression to evaluate
 * @constructor
 */
function Producer( name ) {
	
	if (typeof name === 'undefined') {
		name = uuid.v1()
	}

	debug('dev')( "Producer Created with name: " + name )
	this.name = name;
}

/**
 * Creates an expression based on a random range of numbers
 * @param {Number} min_pos - Small number used in random range
 * @param {Number} max_pos - Large number used in random range
 * @returns {expression} - Example: 1+1=
 */
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