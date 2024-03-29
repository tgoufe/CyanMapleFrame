'use strict';

/**
 * @file    单独抽象的 ajax 请求接口
 *          目前数据请求依赖于 axios 方法
 *          该接口并不会被暴露为框架接口，仅作为二次开发时覆盖用
 *          框架发送 ajax 仍然应使用 ServiceModel 的实例来进行发送
 * @todo    替换为自开发请求类库，优先使用 fetch 接口，降级使用 XMLHttpRequest
 * */

import axios from 'axios';
import log   from '../util/log.js';

/**
 * 发送请求方法
 * @param   {string}    topic
 * @param   {Object}    options
 * @return  {Promise}   在 resolve 时返回由 {topic, options, response as res} 所组成的对象
 *                      在 reject 是返回由 {topic, options, error} 所组成的对象
 * */
let request = (topic, options)=>{
		try{
			let { method
				, data } = options
				;

			if( method === 'GET' ){
				options.params = data;
			}

			return axios(topic, options).then(({data})=>{
				return {
					topic
					, options
					, res: data
				};
			}, (error)=>{
				if( error.response ){
					// 请求完成，返回非 2xx 状态码
				}
				else if( error.request ){
					// 请求未响应
				}
				else{
					log( error.message );
					return Promise.reject( error );
				}

				return {
					topic
					, options
					, error
				};
			});
		}
		catch(e){
			log( e.message );
			return Promise.reject( e );
		}
	}
	, setOpts = (options={})=>{
		Object.entries( options ).forEach(([key, value])=>{
			axios.defaults[key] = value;
		});
	}
	;

export default {
	/**
	 * @summary 与 App 类约定的注入接口
	 * @param   {Base}      app
	 * @param   {Object}    app.$options
	 * @param   {Object}    [app.$options.request]
	 * @desc    注入为 $request
	 * */
	inject(app){
		Object.entries( app.$options.request || {} ).forEach(([key, value])=>{
			axios.defaults[key] = value;
		});

		app.inject('$request', request);
	}
}

export {
	request
	, setOpts
};