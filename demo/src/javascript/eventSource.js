'use strict';

import maple    from 'maple';
import log      from '../log.js';

let sse = maple.model.factory('sse', {
		url: '/test/sse'
	})
	;

sse.on(function(e, topic, newValue, oldValue){
	log('新消息', JSON.stringify(newValue));

	oldValue && log('与上次消息间隔', newValue.timestamp - oldValue.timestamp, '毫秒');
});

maple.listener(window, 'pagehide', ()=>{
	sse.close();
});

maple.view.beforeunload.add(()=>{
	sse.close();
});