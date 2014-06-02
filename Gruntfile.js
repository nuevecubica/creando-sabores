'use strict()';

var config= {
	port: 3000
};

module.exports = function(grunt) {

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		express: {
			options: {
				port: config.port
			},
			development: {
				options: {
					script: 'keystone.js',
					debug: true
				}
			}
		},

		jshint: {
			options: {
				reporter: require('jshint-stylish'),
				force: true,
				jshintrc: '.jshintrc'
			},
			all: [ 'routes/**/*.js',
					'models/**/*.js',
					'public/frontend/js/**/*,js'
			],
			server: [
				'./*.js'
			]
		},

		concurrent: {
			development: {
				tasks: [ 'nodemon', 'node-inspector', 'watch' ],
				options: {
					logConcurrentOutput: true
				}
			}
		},

		'node-inspector': {
			custom: {
				options: {
					'web-host': 'localhost'
				}
			}
		},

		nodemon: {
			debug: {
				script: 'keystone.js',
				options: {
					nodeArgs: ['--debug'],
					env: {
						port: config.port
					}
				}
			}
		},

		watch: {
			js: {
				files: [
					'model/**/*.js',
					'routes/**/*.js'
				],
				tasks: ['jshint:all']
			},
			less: {
				files: [
					'public/frontend/styles/*.less',
					'public/frontend/styles/**/*.less'
				],
				tasks : [ 'less', 'autoprefixer', 'cssmin' ],
				options: {
					livereload: true
				}
			},
			express: {
				files: [
					'keystone.js',
					'public/js/lib/**/*.{js,json}'
				],
				tasks: [ 'jshint:server', 'concurrent:dev' ]
			},
			livereload: {
				files: [
					'public/frontend/styles/**/*.css',
					'public/frontend/styles/**/*.less',
					'templates/**/*.jade',
					'node_modules/keystone/templates/**/*.jade'
				],
				options: {
					livereload: true
				}
			}
		},

		clean: {
			build: {
				src: [ 'public/frontend/fonts/**' ]
			}
		},

		copy: {
			build: {
				files: [{
					expand: true,
					cwd: 'public/packages/semantic-ui/build/less/fonts/',
					src: [ '**' ],
					dest: 'public/frontend/fonts/',
					filter: 'isFile',
				}]
			}
		},

		less: {
			build: {
				options: {
					paths: [ 'public' ]
				},
				files: { 'public/frontend/styles/site.css': 'public/frontend/styles/site.less' }
			}
		},

		autoprefixer: {
			build: {
				options: {},
				src: 'public/frontend/styles/site.css'
			},
		},

		cssmin: {
			build: {
				files: { 'public/frontend/styles/site.min.css': ['public/frontend/styles/site.css'] },
				options: {
					keepSpecialComments: 0,
					banner: '/* Chefcito CSS */'
				}
			}
		}
	});

	grunt.config('env', grunt.option('env') || process.env.GRUNT_ENV || process.env.NODE_ENV || 'development');

	// load jshint
	grunt.registerTask('lint', function(target) {
		grunt.task.run([
			'jshint'
		]);
	});

	// default option to connect server
	grunt.registerTask('serve', function(target) {
		grunt.task.run([
			'jshint',
			'concurrent:dev'
		]);
	});

	grunt.registerTask('development', function () {
		grunt.task.run([ 'jshint' ]);
		grunt.task.run([ 'less:build' ]);
		grunt.task.run([ 'autoprefixer:build' ]);
		grunt.task.run([ 'cssmin:build' ]);
		grunt.task.run([ 'clean' ]);
		grunt.task.run([ 'copy' ]);
	});

	grunt.registerTask('production', function () {
		grunt.task.run([ 'less:build' ]);
		grunt.task.run([ 'autoprefixer:build' ]);
		grunt.task.run([ 'cssmin:build' ]);
		grunt.task.run([ 'clean' ]);
		grunt.task.run([ 'copy' ]);
	});

	grunt.registerTask('default', function () {
		grunt.task.run([grunt.config('env')]);
	});

	grunt.registerTask('build', function () {
		grunt.task.run([grunt.config('env')]);
	});
};
