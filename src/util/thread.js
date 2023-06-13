'use strict';

/**
 * @file    利用 worker 建立独立线程
 * */

import {strToURL} from './transformer.js';

/**
 * @summary     利用 worker 建立独立线程
 * @function    thread
 * @memberOf    maple.util
 * @param       {Function}  executor=()=>{}
 * @param       {boolean}   once=true
 * @return      {Function}
 * */
let thread = function(executor=()=>{}, once=true){
	let worker = new Worker( strToURL(`
let executor = ${executor.toString()}
	;

onmessage = function(e){
	try{
		postMessage( executor(e.data) );
	}
	catch(error){
		postMessage( error );
	}			
};
`, 'text/javascript') )
		;

	return function(data){
		return new Promise(function(resolve, reject){
			let result = {}
				;
			
			Object.defineProperty(result, 'data', {
				set(v){
					resolve( v );
				}
			});

			if( !worker ){
				reject( new Error('worker 已终止') );
			}

			worker.postMessage( data );
			worker.onmessage = function(e){
				let data = e.data
					;

				worker.onmessage = null;

				if( once ){
					worker.terminate();
					worker = null;
				}

				if( data instanceof Error ){
					reject( e.data );
				}
				else{
					result.data = e.data
				}
			};
			worker.onerror = reject;
		});
	};
};

export default thread;