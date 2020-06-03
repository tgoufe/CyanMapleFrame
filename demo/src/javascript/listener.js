'use strict';

import maple    from 'maple';
import log      from '../log.js';

document.body.style.height = '10000px';

window.tempMaple = maple;

maple.view.scroll( maple.util.debounce(function(){
	log('debounce', Date.now());
	log(this, ...arguments);
	log( maple.view.scroll.scrollBar('top') );
}, 1000, 4000) );

maple.view.scroll( maple.util.throttle(function(){
	log('throttle', Date.now());
	log(this, ...arguments);
	log( maple.view.scroll.scrollBar('top') );
}, 1000, true) );

maple.url.hashChange(function(e){
	log('hashChange');
	log(this, ...arguments);
});
log(maple.listener._callbackList);

maple.url.popState(function(e){
	log('popState');
	log(this, ...arguments);
});
log(maple.listener._callbackList);