'use strict';

import maple    from '../../../src/maple/base.js';
import log      from '../log.js';

document.body.style.height = '10000px';

window.tempMaple = maple;

maple.view.scroll.add( maple.util.debounce(function(){
	log('debounce', Date.now());
	log(this, arguments);
	log( maple.view.scroll.scrollBar('top') );
}, 1000, 4000) );

maple.view.scroll.add( maple.util.throttle(function(){
	log('throttle', Date.now());
	log(this, arguments);
	log( maple.view.scroll.scrollBar('top') );
}, 1000, true) );

maple.url.hashChange.add(function(e){
	log('hashChange');
	log(this, arguments);
});
console.log(maple.url.hashChange._eventQueue._queue.length);

maple.url.popState.add(function(e){
	log('popState');
	log(this, arguments);
});
log(maple.url.popState._eventQueue._queue.length);