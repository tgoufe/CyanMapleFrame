'use strict';

import $    from 'jquery';

/**
 * 发送请求方法
 * @param   {String}    topic
 * @param   {Object}    options
 * @return  {Promise}
 * */
let request = (topic, options)=>{
	try{
		return $.ajax(topic, options).then((res)=>{
			return res;
		}, (msg)=>{
			return Promise.reject( msg );
		});
	}
	catch(e){
		console.log( e.message );
		return Promise.reject( e );
	}
};

export default request;