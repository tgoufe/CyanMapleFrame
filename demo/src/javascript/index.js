'use strict';

import maple    from 'maple';

import config   from '../config.json';

import Vue  from 'vue';

let vm = new Vue({
		el: '#app'
		, data: {
			list: config.pages.map((page)=>{
				return {
					url: `./${page.entry}.html`
					, title: page.title
				};
			})
		}
	})
	;

window.vm = vm;