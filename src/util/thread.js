'use strict';

/**
 * @file    利用 worker 建立独立线程
 * */

/**
 * @summary     利用 worker 建立独立线程
 * @function    thread
 * @memberOf    maple.util
 * @param       {Function}  executor=()=>{}
 * @param       {boolean}   once=true
 * @return      {Function}
 * */
let thread = function(executor=()=>{}, once=true){
	let code = `
var executor = ${executor.toString()}
	;
self.onmessage = function(e){
	try{
		self.postMessage( executor(e.data) );
	}
	catch(e){
		self.postMessage( e );
	}			
}
`
		, blob = new Blob([code], {
			type: 'text/javascript'
		})
		, worker = new Worker( URL.createObjectURL(blob) )
		;

	return function(data){
		return new Promise(function(resolve, reject){
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
					resolve( e.data );
				}
			};
			worker.onerror = reject;
		});
	};
};

export default thread;