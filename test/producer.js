var assert = require("assert"),
    Producer = require('../libs/addmeup/services/Producer');

describe('Producer', function() {
  describe('#create()', function () {
    it('should generate random addition expressions of two positive integers, e.g. "2+3="', function () {

    	// get a random expression
    	// allowed method to accept a range 1 to 1000 with operator + to assist with randomization
      producer = new Producer();
      producer.create(1, 1000, ['+'], function( error, results ) {
        var regex = /^([0-9]+)\+[0-9]+\=$/
        assert.equal( results['expression'].toString().match(regex) instanceof Array, true )
      })

    });
  });
});