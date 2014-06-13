var should = require('should'),
		assert = require('assert'),
		request = require('supertest');

var config = require(__dirname + '/../../../../config-development-test.js');

request = request(config.url);

describe('GET /user/:username/check', function (){
  describe('Request valid user', function (){
		it('respond with success', function (done) {
			request
      .get('/api/v1/user/testUser1/check')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
	  })
  })
});