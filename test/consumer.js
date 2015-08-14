var assert = require("assert"),
	Producer = require('../libs/addmeup/services/Producer'),
	Consumer = require('../libs/addmeup/services/Consumer');

describe('Consumer', function() {
	describe('#compute()', function () {
		it('should compute and return the correct mathematical result for the each expression it receives', function () {

			// get a random expression
			// allowed method to accept a range 1 to 1000 with operator + to assist with randomization
			producer = new Producer();
			producer.create(0, 9, function( error, results ) {
				expression_arr = results['expression'].toString().split( '' )
				Consumer.run( results, function( error, results ) {
					assert.equal( results['equals'], eval( expression_arr[0] + expression_arr[1] + expression_arr[2] ) )
				})
			})
	
		});
	});
});