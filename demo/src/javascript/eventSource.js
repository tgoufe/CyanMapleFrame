'use strict';

import maple    from 'maple';
import log      from '../log.js';

let ess = maple.model.factory('sse', {
		url: '/test/sse'
	})
	;

ess.on(function(e, topic, newValue, oldValue){
	log('新消息', JSON.stringify(newValue));

	oldValue && log('与上次消息间隔', newValue.timestamp - oldValue.timestamp, '毫秒');
});

maple.listener(window, 'pagehide', ()=>{
	ess.close();
});

maple.view.beforeunload.add(()=>{
	ess.close();
});