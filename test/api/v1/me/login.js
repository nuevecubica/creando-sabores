var should = require('should'),
		assert = require('assert'),
		request = require('supertest'),
		path = require('path'),
		appDir = path.dirname(require.main.filename);

var config = require(__dirname + '/../../../../config-development-test.js');

request = request(config.url);

describe('POST /me/login', function (){

	describe('No data', function (){
		it('respond with error', function (done) {
			request
			.post('/api/v1/me/login')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200, done)
			.expect(function (res) {
				if (!res.body.error || res.body.success) {
					return 'error';
				}
			});
		})
	});

	describe('Invalid credentials', function (){
		it('respond with unsuccess', function (done) {
			request
			.post('/api/v1/me/login')
			.send({ email: 'testUser1@glue.gl', password: 'garbage' })
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(200, done)
			.expect(function (res) {
				if (res.body.success || res.body.error) {
					return 'error';
				}
			});
		})
	});

});