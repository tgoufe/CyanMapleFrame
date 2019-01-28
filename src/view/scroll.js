'use strict';

/**
 * @file    全局事件 scroll
 *          使用捕捉方式
 * */

import {listener}   from '../listener.js';

/**
 * @class
 * @classdesc   基于 IntersectionObserver 封装
 * */
class ScrollObserver {
	/**
	 * @constructor
	 * @param   {Object}    [options={}]
	 * @param   {Element}   [options.root]
	 * @param   {string}    [options.rootMargin]    计算交叉值时添加至根的边界盒中的一组偏移量，语法和 CSS 中的 margin 属性等同，默认值为 '0px 0px 0px 0px'
	 * @param   {number}    [options.threshold]     监听目标与边界盒交叉区域的比例值，从 0.0 到 1.0 之间的数组
	 * */
	constructor(options={}){
		this._listener = listener('intersection');

		this._observer = new Promise((resolve, reject)=>{
			if( 'IntersectionObserver' in self ){
				resolve( new IntersectionObserver((entries)=>{
					entries.forEach((entry)=>{
						this._listener.trigger(entry);
					});
				}, options) );
			}
			else{
				reject( new Error('当前浏览器不支持 IntersectionObserver') );
			}
		});
	}

	/**
	 * @summary     监听回调函数
	 * @callback    IntersectionCallback
	 * @param       {Object}                    event
	 * @param       {IntersectionObserverEntry} entry
	 * */

	/**
	 * @summary 监听一个目标元素
	 * @param   {Element|NodeList|HTMLCollection}   target
	 * @param   {Function}                          handler
	 * */
	observe(target, handler){
		if( target instanceof Element ){
			this._observer.then((observer)=>{
				observer.observe( target );
			});
		}
		else if( target instanceof NodeList || target instanceof HTMLCollection ){
			this._observer.then((observer)=>{
				Array.from( target ).forEach((element)=>{
					observer.observe( element );
				});
			});
		}
		else{
			console.log('监听目标非 Element、NodeList、HTMLCollection 类型对象，无法监听');
			return;
		}

		this._listener.add( handler );
	}
	/**
	 * @summary 停止监听目标元素
	 * @param   {Element}   target
	 * */
	unobserve(target){
		this._observer.then((observer)=>{
			observer.unobserve( target );
		});
	}
	/**
	 * @summary 停止监听工作
	 * */
	disconnect(){
		this._observer.then((observer)=>{
			observer.disconnect();

			this._observer = Promise.reject( new Error('监听已停止') );
		});
	}
}

/**
 * @memberOf    maple.view
 * @type        {Listener}
 * */
let scroll = listener('scroll', {
		useDebounce: true
	})
	, scrollTarget
	, body = document.body
	, doc = document.documentElement
	, tempTop = body.scrollTop
	;

/**
 * @summary     禁止页面滚动
 * @method
 * @memberOf    scroll
 * @param       {boolean}   disabled
 * */
scroll.disabled = function(disabled){
	if( disabled ){
		this._overflowState = window.getComputedStyle( body ).overflow || 'visible';

		body.style.overflow = 'hidden';
	}
	else{
		body.style.overflow = this._overflowState || 'visible';
	}
};

/**
 * 测试获取滚动条信息的对象为 document.body 还是 document.documentElement
 * */

body.scrollTop = tempTop +1;

if( body.scrollTop === tempTop +1 ){    // document.body 可用
	scrollTarget = body;

	body.scrollTop = tempTop;
}
else{
	scrollTarget = doc;
}

/**
 * @summary     设置或读取当前页面滚动条位置
 * @method
 * @memberOf    scroll
 * @param       {string}        offset  获取方位基准，取值为 'top','bottom','left','right' 中一个
 * @param       {string|number} [value] 设置滚动条的位置
 * @return      {Object|null}
 * */
scroll.scrollBar = function(offset, value){
	let argc = arguments.length
		, curr = 0
		, total = 1
		, view = 1
		, regexp = /^(\d+(?:\.\d+)?)(%|view)?$/
		, temp
		;

	if( argc === 1 ){   // 读操作

		switch( arguments[0] ){
			case 'top':
				total = scrollTarget.scrollHeight;
				curr = scrollTarget.scrollTop;
				view = doc.clientHeight;
				break;
			case 'bottom':
				total = scrollTarget.scrollHeight;
				view = doc.clientHeight;
				curr = total - scrollTarget.scrollTop - view;
				break;
			case 'left':
				total = scrollTarget.scrollWidth;
				curr = scrollTarget.scrollLeft;
				view = doc.clientWidth;
				break;
			case 'right':
				total = scrollTarget.scrollWidth;
				view = doc.clientWidth;
				curr = total - scrollTarget.scrollLeft - view;
				break;
			default:
				break;
		}

		return {
			px: curr
			, percent: Math.floor(curr / total * 100)
			, view: parseFloat((curr / view).toFixed(1))
		};
	}
	else{   // 写 操作
		temp = regexp.exec( value );

		if( temp ){
			switch( offset ){
				case 'top':
					curr = parseFloat(temp[1]);

					if (temp[2] === '%') {  // 百分比
						curr = curr * scrollTarget.scrollHeight / 100;
					}
					else if (temp[2] === 'view') {  // 屏数
						curr = curr * doc.clientHeight;
					}

					scrollTarget.scrollTop = curr;
					break;
				case 'bottom':
					curr = parseFloat(temp[1]);

					if (temp[2] === '%') {  // 百分比
						curr = Math.max(scrollTarget.scrollHeight * (1 - curr / 100), 0);
					}
					else if (temp[2] === 'view') {  // 屏数
						curr = Math.max(scrollTarget.scrollHeight - curr * doc.clientHeight, 0);
					}
					else{
						curr = Math.max(scrollTarget.scrollHeight - curr, 0);
					}

					scrollTarget.scrollTop = curr;
					break;
				case 'left':
					curr = parseFloat(temp[1]);

					if (temp[2] === '%') {  // 百分比
						curr = curr * scrollTarget.scrollWidth / 100;
					}
					else if (temp[2] === 'view') {  // 屏数
						curr = curr * doc.clientWidth;
					}

					scrollTarget.scrollLeft = curr;
					break;
				case 'right':
					curr = parseFloat(temp[1]);

					if (temp[2] === '%') {  // 百分比
						curr = Math.max(scrollTarget.scrollWidth * (1 - curr / 100), 0);
					}
					else if (temp[2] === 'view') {  // 屏数
						curr = Math.max(scrollTarget.scrollWidth - curr * doc.clientWidth, 0);
					}
					else{
						curr = Math.max(scrollTarget.scrollWidth - curr, 0);
					}

					scrollTarget.scrollLeft = curr;
					break;
				default:
					break;
			}
		}
		else{
			console.log('scrollBar 参数设置错误');
		}
	}
};

scroll.observer = new ScrollObserver();

scroll.resetObserver = function(options={}){
	scroll.observer.disconnect();
	scroll.observer = new ScrollObserver( options );
};

export default scroll;

export {
	ScrollObserver
};