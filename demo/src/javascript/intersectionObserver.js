'use strict';

import maple    from 'maple';
import log      from '../log.js';

// document.querySelectorAll('.observe').forEach((element)=>{
// 	maple.view.scroll.observer.observe(element, maple.util.debounce((e, entry)=>{
// 		log(e, entry, entry.target.id);
// 	}, 1000));
// });

// maple.view.scroll.observer.observe(document.querySelectorAll('.observe'), maple.util.debounce((e, entry)=>{
// 	log(e, entry, entry.target.id);
// }, 1000));
maple.view.scroll.observer.observe(document.querySelectorAll('.observe'), (e, entry)=>{
	log(e, entry, entry.target.id);
});