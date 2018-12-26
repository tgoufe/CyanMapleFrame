'use strict';

/**
 * @file    Web Worker 后台执行文件
 * */

import postMessage  from '../view/postMessage.js';

function workerRun(url, options={}){
	let worker = new Worker(url, options)
		;

	return {
		postMessage(){
			postMessage(worker, [...arguments]);
		}
		, close(){
			worker.terminate();
		}
	}
}

export default workerRun;