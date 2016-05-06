'use strict';

var path = require('path')
	, express = require('express')
	, web = express()

	//----- Web 服务器及相关组件 -----
	, bodyParser    = require('body-parser')
	, cookie        = require('cookie')
	, cookieParser  = require('cookie-parser')
	, log4js        = require('log4js')
	, logger        //= require('morgan')
	, session       = require('express-session')
	, sessionStore  = new session.MemoryStore()

	, CONFIG = require('../config.js')
	, PORT = CONFIG.PORT
	, PROJECT_ROOT = path.resolve(__dirname, '../') +'/'
	;

// 设置日志
log4js.configure({
	appenders: [{
		type: 'console'
	}, {
		type: 'file'
		, filename: PROJECT_ROOT +'/log/access.log'
		, maxLogSize: 1024 * 1024 * 1000
		, backups: 4
		, category: 'normal'
	}]
	, replaceConsole: true
});
logger = log4js.getLogger('normal');
logger.setLevel('INFO');

//----- web 服务器设置 -----
web.use( bodyParser.json() );
web.use( bodyParser.urlencoded({extended: true}) );
web.use( cookieParser() );
web.use( log4js.connectLogger(logger, {format: ':method :url :remote-addr'}) );

// 设置 session
session = session({
	store: sessionStore
	, secret:   CONFIG.cookieSecret
	, key:      CONFIG.cookieKey
	, resave:   false
	, saveUninitialized: true
});
web.use( session );

// 加载 slider 数据接口模块
require('./slider.js')(web);

web.listen(PORT, function(e){
	if( e ){
		console.log(e);
		return;
	}
	console.log('监听 http://localhost:' + PORT +'\n');
});