'use strict';

const path = require('path')
	, srcPath = path.resolve(__dirname, '../../src')
	;

module.exports = function(config) {
	config.set({
		webpack: {
			// 不需要 entry 和 output
			devtool: 'inline-source-map', // 推荐使用inline-source-map
			module: {
				rules: [{
					test: /\.js$/
					, loader: 'babel-loader'
					, exclude: /node_modules/
					, query: {
						presets: ['es2015']
						// 在覆盖率中去掉  webpack 生成代码
						, plugins: ['istanbul']
					}
				}]
			}
		},
		frameworks: ['mocha', 'sinon-chai'], // 测试框架随便一定要要和我一样
		files: [
			// files 只留下 test 文件。因为 webpack 会自动把需要的其它文件都打包进来，所以只需要留下入口文件
			// 推荐使用一个入口来导入所有的测试。
			'./index.js'
		],
		preprocessors: {
			// preprocessors 修改为 test 文件，并加入webpack域处理器
			'./index.js': ['webpack'
				, 'sourcemap'
				// 使用了 istanbul 去掉 coverage
				// , 'coverage'
			] // 使用什么配置
		},
		reporters: ['spec', 'coverage', 'progress'], // spec显示插件
		port: 9876, // 端口
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: false,
		browsers: ['Chrome'],
		singleRun: false

		, plugins: [
			'karma-webpack'
			, 'karma-sourcemap-loader'
			, 'karma-mocha'
			, 'karma-chai'
			, 'karma-sinon-chai'
			, 'karma-chrome-launcher'
			, 'karma-spec-reporter'
			, 'karma-coverage'
		]
		, coverageReporter: {
			dir: './coverage',
			reporters: [
				{ type: 'html', subdir: 'report-html' },
				// { type: 'lcov', subdir: '.' },
				// { type: 'text-summary' }
			]
		}
	});
};