'use strict';

import maple    from '../../../src/maple/base.js';

document.body.style.height = '10000px';

window.tempMaple = maple;

maple.view.scroll.add( maple.util.debounce(function(){
	console.log('debounce', Date.now());
	console.log(this, arguments);
	console.log( maple.view.scroll.scrollBar('top') );
}, 1000, 4000) );

maple.view.scroll.add( maple.util.throttle(function(){
	console.log('throttle', Date.now());
	console.log(this, arguments);
	console.log( maple.view.scroll.scrollBar('top') );
}, 1000, true) );

maple.url.hashChange.add(function(e){
	console.log('hashChange');
	console.log(this, arguments);
});
console.log(maple.url.hashChange._eventQueue._queue.length);

maple.url.popState.add(function(e){
	console.log('popState');
	console.log(this, arguments);
});
console.log(maple.url.popState._eventQueue._queue.length);