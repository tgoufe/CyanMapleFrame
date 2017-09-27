'use strict';

/**
 * @file    获取当前页面路径参数，并提供页面跳转方法
 *          整合 location 和 history 功能
 * */

// const PARAMS_FILTER = [
// 		'10000skip' // 微信下 10000skip
// 	]
// 	;

import CONFIG       from '../config.js';
import {listener}   from '../listener.js';

/**
 * @class
 * @classdesc   url 解析
 * */
class Url{
	/**
	 * @constructor
	 * @param   {String}    [url]
	 * */
	constructor(url){
		let a = document.createElement('a', CONFIG.ceKey)
			;

		a.href = url || location.href;

		this.source     = a.href;
		this.protocol   = a.protocol.replace(':', '');
		this.origin     = a.origin;
		this.host       = a.hostname;
		this.port       = a.port;
		this.path       = a.pathname.replace(/^([^\/])/, '$1');
		// 相对路径
		this.relative   = (a.href.match(/tps?:\/\/[^\/]+(.*)/) || ['', ''])[1];
		// 当前页面文件名
		this.file       = (a.pathname.match(/\/([^\/?#]+)$/i) || ['', ''])[1];
		// 当前页面目录
		this.dir        = this.path.replace(this.file, '');
		// todo ?
		this.segments   = a.pathname.replace(/^\//, '').split('/');
		// 参数对象
		this.params     = this.parseSearch( a.search );
		// hash
		this.hash       = a.hash.slice(1);
		// 页面来源
		this.from       = document.referrer;

		a = null;   // 释放内存
	}

	// ---------- 公有属性 ----------
	get query(){    // 当前页面参数拼接字符串
		let query = Object.keys( this.params ).reduce((all, d)=>{
				all.push( encodeURIComponent(d) +'='+ encodeURIComponent(this.params[d]) );

				return all;
			}, [])
			;

		return query.length ? '?'+ query.join('&') : '';
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary     解析 url 的 search 部分
	 * @param       {String}    [search='']
	 * @return      {Object}
	 * */
	parseSearch(search=''){
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
	 * @summary     将现有参数组合成一个 url
	 * @return      {String}
	 * @todo        onlyPath 参数保留？
	 * */
	pack(){
		return this.protocol +'://'+
			this.host +
			(!this.port || this.port === '80' ? '' : ':'+ this.port) +
			this.path +
			this.query +
			(this.hash ? '#'+ this.hash : '');
	}
	/**
	 * @summary     替换当前的 params
	 * @param       {Object|String[]|...String} params
	 * @return      {Object}                    this
	 * @desc        当为多个 string 时，为删除当前 url 上参数，当为 object 时为设置当前 url 上参数
	 * */
	changeParams(params){
		let argv
			;

		if( typeof params === 'string' ){
			argv = [].slice.call( arguments );
		}
		else{
			argv = params;
		}

		if( Array.isArray( argv ) ){
			argv.forEach((d)=>{
				if( typeof d === 'string' ){
					delete this.params[d];
				}
			});
		}
		else if( typeof argv === 'object' ){
			Object.keys( argv ).forEach((d)=>{
				this.params[d] = params[d];
			});
		}

		return this;
	}
}

let url = new Url()
	;

/**
 * @summary     Url 类对象
 * @type        {Url}
 * @memberOf    url
 *
 * */
url.Url = Url;
/**
 * @summary     对 url 进行解析
 * @method
 * @memberOf    url
 * @param       {String|Url}    url
 * @return      {Url}           若出入的 url 参数是一个 Url 对象，则不做处理直接返回
 * */
url.parseUrl = (url)=>{
	if( url instanceof Url ){
		return url;
	}
	else if( typeof url === 'string' ){
		return new Url( url );
	}
	else{
		return new Url();
	}
};
/**
 * @summary     对没有协议头（以 // 开头）的路径加上协议头
 * @method
 * @memberOf    url
 * @param       {String}    url
 * @return      {String}
 * */
url.addProtocol = (url)=>{
	return /^\/\//.test( url ) ? location.protocol + url : url;
};
/**
 * @summary     刷新当前页面
 * @method
 * @memberOf    url
 * */
url.reload = ()=>{
	location.reload();
};
/**
 * @summary     页面后退
 * @method
 * @memberOf    url
 * */
url.back = ()=>{
	history.back();
};
/**
 * @summary     调整参数并指向调整后的路径，当前 url 添加到历史记录
 * @method
 * @memberOf    url
 * @param       {Object|String[]|...String} params
 * @param       {*|Object}                  [pushState]
 * @return      {Url}                       this
 * @desc        只有两种情况下 pushState 才有效：
 *              1.当 params 是 Object 类型时
 *              2.当不满足 1 条件时，参数中的最后一个为 Object 类型时，视为 pushState
 * */
url.push = function(params, pushState){
	let argc = arguments.length
		, argv = arguments
		, state = null
		;

	if( argc > 1 ){
		if( typeof params === 'object' ){
			state = arguments[1];
		}
		else if( typeof arguments[argc -1] === 'object' ){
			state = arguments[argc -1];
			argv = [].slice.call(arguments, 0, -1);
		}
	}

	this.changeParams(...argv);

	// 将当前浏览器上 url 换为替换后组装出来的链接，当期 url 进入
	history.pushState(state, '', this.pack());

	return this;
};
/**
 * @summary     将 url 指向目标路径，当前 url 添加到历史记录
 * @method
 * @memberOf    url
 * @param       {String}    href
 * @param       {Object}    [state=null]
 * @return      {Url}       this
 * */
url.pushHistory = function(href, state=null){
	history.pushState(state, '', href);
	
	return this;
};
/**
 * @summary     跳转到目标页面，当前 url 添加到历史记录
 * @method
 * @memberOf    url
 * @param       {String}    href
 * */
url.changePage = function(href){
	location.assign( href );
};
/**
 * @summary     替换当前 url 上的参数
 * @method
 * @memberOf    url
 * @param       {Object|String[]|...String} params
 * @return      {Url}                       this
 * */
url.replace = function(params){
	this.changeParams(...arguments);

	// 将当前浏览器上 url 换为替换后组装出来的链接
	history.replaceState(null, '', this.pack());

	return this;
};
/**
 * @summary     替换当前 url 为目标路径
 * @method
 * @memberOf    url
 * @param       {String}    href
 * @param       {Object}    [state=null]
 * @return      {Url}       this
 * */
url.replaceHistory = function(href, state=null){
	history.replaceState(state, '', href);

	return this;
};
/**
 * @summary     替换当前 url 为目标路径，页面刷新
 * */
url.replacePage = function(href){
	location.replace( href );
};
/**
 * @summary     监听 hashChange 事件
 * @type        {Listener}
 * @memberOf    url
 * */
url.hashChange = listener('hashchange', (e, newUrl)=>{
	let temp
		;

	if( e.newUrl ){
		temp = url.parseUrl( e.newUrl );
	}
	else if( newUrl ){
		temp = url.parseUrl( newUrl );
	}

	if( temp ){
		url.hash = temp.hash;
	}
});
/**
 * @summary     监听 popstate 事件
 * @type        {Listener}
 * @memberOf    url
 * */
url.popState = listener('popstate', (e, newUrl)=>{
	let temp
		, state = e.state
		;

	if( newUrl ){
		temp = url.parseUrl( newUrl );
	}
	else{
		temp = url.parseUrl( location.href );
	}

	if( typeof state === 'string' ){
		try{
			state = JSON.parse( state );
		}
		catch(e){}
	}

	// todo state 做什么？
	console.log(state);

	// 替换当期 url 对象属性 todo 更好的实现？
	Object.keys( temp ).forEach((k)=>{
		url[k] = temp[k];
	});
});

/**
 * @exports     url
 * @type        {Object}
 * @memberOf    maple
 * */
export default url;