'use strict';

/**
 * @file    获取当前页面路径参数，并提供页面跳转方法
 * */

// const PARAMS_FILTER = [
// 		'10000skip' // 微信下 10000skip
// 	]
// 	;

import {listener}   from '../listener.js';

/**
 * @summary     解析 url 的 search 部分
 * @method
 * @memberOf    url
 * @param       {String}    [search='']
 * return       {Object}
 * */
function parseSearch(search=''){
	if( search && /^\?/.test(search) ){
		search = search.slice(1);
	}

	return search ? search.split('&').reduce((all, d)=>{
		let temp
			;

		if( d ){
			temp = d.split('=');

			// 解码
			all[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1] || '').replace(/\?10000skup(=true)?/, '');  // 删除微信下的?10000skip todo ?
		}

		return all;
	}, {}) : {};
}

/**
 * @summary     解析 url
 * @method
 * @memberOf    url
 * @param       {String}    [url]   未传 url，默认使用 location.href
 * @return      {Object}
 * */
function parseUrl(url){
	let a = document.createElement('a')
		, result = {}
		;

	a.href = url || location.href;

	result.source      = a.href;
	result.protocol    = a.protocol.replace(':', '');
	result.host        = a.hostname;
	result.port        = a.port;
	result.query       = a.search;
	result.params      = parseSearch( a.search );
	result.file        = (a.pathname.match(/\/([^\/?#]+)$/i) || ['', ''])[1];
	result.hash        = a.hash.slice(1);
	result.path        = a.pathname.replace(/^([^\/])/, '$1');
	result.relative    = (a.href.match(/tps?:\/\/[^\/]+(.*)/) || ['', ''])[1];  // todo ?
	result.segments    = a.pathname.replace(/^\//, '').split('/');  // todo ?

	a = null;   // 释放内存

	return result;
}

let runtimeUrl = parseUrl()
	;

runtimeUrl.parseUrl = parseUrl;

runtimeUrl.parseSearch = parseSearch;

/**
 * @summary     替换当前的 query 和 params
 * @private
 * @method
 * @memberOf    url
 * @param       {Object|...String}  param
 * */
runtimeUrl._changeParams = function(param){
	let search
		;

	switch( typeof param ){
		case 'string':
			Array.prototype.slice.call( arguments ).forEach((d)=>{
				if( typeof d === 'string' ){
					delete this.params[d];
				}
			});
			break;
		case 'object':
			Object.keys( param ).forEach((d)=>{
				this.params[d] = param[d];
			});
			break;
		default:
			break;
	}

	search = Object.keys( this.params ).reduce((all, d)=>{
		all.push( encodeURIComponent(d) +'='+ encodeURIComponent(this.params[d]) );

		return all;
	}, []);

	this.query = search.length ? '?'+ search.join('&') : '';
};
/**
 * @summary     将现有参数组合成一个 url
 * @method
 * @memberOf    url
 * @return      {String}
 * */
runtimeUrl.pack = function(){
	return this.protocol +'://'+
		this.host +
		(!this.port || this.port === '80' ? '' : ':'+ this.port) +
		this.path +
		this.query +
		(this.hash ? '#'+ this.hash : '');
};
/**
 * @summary     添加参数并调整到路径
 * @method
 * @memberOf    url
 * @param       {Object|...String} params
 * */
runtimeUrl.push = function(params){

	this._changeParams.apply(this, arguments);

	// 跳转到页面
	location.href = this.pack();
};
/**
 * @summary     替换当前 url 上的参数
 * @method
 * @memberOf    url
 * @param       {Object|...String} params
 * */
runtimeUrl.replace = function(params){

	this._changeParams.apply(this, arguments);

	// 将当前浏览器上 url 换为替换后组装出来的链接
	history.replaceState(null, '', this.pack());
};
/**
 * @summary     刷新当前页面
 * @method
 * @memberOf    url
 * */
runtimeUrl.reload = function(){
	location.reload();
};

/**
 * @summary     对没有协议头（以 // 开头）的路径加上协议头
 * @method
 * @memberOf    url
 * @param       {String}    url
 * @return      {String}
 * */
runtimeUrl.addProtocol = function(url){
	return /^\/\//.test( url ) ? location.protocol + url : url;
};

/**
 * 
 * */
runtimeUrl.hashChange = listener('hashchange', function(e){
	runtimeUrl.hash = parseUrl( e.newUrl ).hash;
});

/**
 * @exports     url
 * @type        {Object}
 * @memberOf    maple
 * */
export default runtimeUrl;