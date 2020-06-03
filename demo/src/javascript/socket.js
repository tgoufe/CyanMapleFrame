'use strict';

import maple    from 'maple';
import log      from '../log.js';

maple.useAxios();

let service = maple.model.factory('s')
	, socket
	;

socket = maple.model.factory('socket', {
	// url: location.host +'/socket.io/?EIO=3&transport=webSocket&sid='+ data.sid
	url: location.host
	// , binaryType: 'arraybuffer'
});

let btn = document.createElement('button')
	, input = document.createElement('input')
	;

input.type = 'text';

btn.type = 'button';
btn.innerHTML = '发送信息';
btn.addEventListener('click', function(){
	log('向服务器发送', input.value);

	socket.setData('/test/socket', {
		value: input.value
	});
});

document.body.appendChild( input );
document.body.appendChild( btn );

socket.on((e, topic, data)=>{
	log(e, topic, JSON.stringify(data));
});