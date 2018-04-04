'use strict';

/**
 * @file    单独抽象的 ajax 请求接口
 *          目前数据请求依赖于 jQuery.ajax 方法
 *          该接口并不会被暴露为框架接口，仅作为二次开发时覆盖用
 *          框架发送 ajax 仍然应使用 ServiceModel 的实例来进行发送
 * @todo    替换为自开发请求类库
 * @todo    优先使用 fetch 接口，降级使用 XMLHttpRequest
 * */

import $    from 'jquery';

/**
 * 发送请求方法
 * @param   {string}    topic
 * @param   {Object}    options
 * @return  {Promise}   在 resolve 时返回由 topic, options, response 所组成的对象
 * */
let request = (topic, options)=>{
	try{
		return $.ajax(topic, options).then((res)=>{
			return {
				topic
				, options
				, res
			};
		}, (xhr, textStatus, msg)=>{
			let error = new Error( msg )
				;

			error.textStatus = textStatus;
			error.xhr = xhr;

			console.log( error );

			return {
				topic
				, options
				, error
			};
			// return Promise.reject( msg );
		});
	}
	catch(e){
		console.log( e.message );
		return Promise.reject( e );
	}
};

export default request;

let requestOriginal = (topic, options)=>{

		return new Promise((resolve, reject)=>{
			let xhr = new XMLHttpRequest()
				, formData
				;

			if( options.data ){
				if( typeof options.data === 'object' ){

				}
			}
			else if( typeof options.data === 'string' ){

			}

			xhr.open(options.method || options.type || 'GET', topic, true);

		});
	}
	;