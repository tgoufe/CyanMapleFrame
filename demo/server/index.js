'use strict';

let express = require('express')
	, web   = express()
	, webServer

	, WebSocket = require('ws')
	, webSocketServer
	;

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

webServer = web.listen(9003, ()=>{
	console.log('服务器运行中');
});

/**
 * Web Socket 测试
 * */
webSocketServer = new WebSocket.Server({
	server: webServer
});

webSocketServer.on('connection', (ws, req)=>{
	console.log('浏览器建立连接');

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