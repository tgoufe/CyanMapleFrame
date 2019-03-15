'use strict';

let express = require('express')
	, web   = express()
	, webServer

	, bodyParser    = require('body-parser')
	, cookie        = require('cookie')
	, cookieParser  = require('cookie-parser')
	, session       = require('express-session')
	, sessionStore  = new session.MemoryStore()

	, WebSocket = require('ws')
	, webSocketServer
	;

const PORT = 9003
	;

web.use( bodyParser.json() );
web.use( bodyParser.urlencoded({extended: true}) );
web.use( cookieParser() );
web.use( session({
	store: sessionStore
	, secret: 'secret'
	, key: 'express.sid'
	, resave: false
	, saveUninitialized: true
}) );

web.use('/', express.static(__dirname +'/../dist/'));

/**
 * Server Send Event 测试接口
 * */
let counter = 0
	;
web.get('/test/sse', function(req, res){
	res.set('Content-Type', 'text/event-stream');

	let loop = setInterval(function(){
			counter++;

			res.write('data:' + JSON.stringify({
				topic: 'test'
				, data: {
					timestamp: Date.now()
					, counter: counter
				}
			}) +'\n\n' );
		}, 5000)
		;

	req.connection.on('end', function(){
		console.log('浏览器关闭或客户端断开连接');
		clearInterval( loop );

		res.end();
	});
});

webServer = web.listen(PORT, ()=>{
	console.log(`服务器运行中，端口号 ${PORT}`);
});

/**
 * Web Socket 测试
 * */
webSocketServer = new WebSocket.Server({
	server: webServer
});

webSocketServer.on('connection', (ws, req)=>{
	console.log('浏览器建立连接');

	ws.req = req;

	let cookies = cookie.parse( req.headers.cookie )
		, sid = cookieParser.signedCookie(cookies['express.sid'], 'secret')
		;

	sessionStore.get(sid, function(err, ss){
		if( err ){
			return;
		}
		
		sessionStore.createSession(req, ss);
	});

	ws.on('message', (message)=>{
		console.log('收到浏览器端发送信息', message);

		console.log(typeof message);
		try{
			message = JSON.parse( message );
		}
		catch(e){
			message = {
				topic: ''
				, data: message
			};
		}

		ws.send( JSON.stringify({
			topic: 'test/socket'
			, data: message.data
		}) );
	});

	ws.send( JSON.stringify({
		topic: 'test/socket'
		, data: '服务器发送的信息'
	}) );

	ws.on('error', (e)=>{
		console.log('发生错误', e);
	});

	ws.on('close', (e)=>{
		console.log('浏览器关闭连接', e);
	});
});