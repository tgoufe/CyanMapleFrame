'use strict';

/**
 * @file    全局事件 scroll
 *          使用捕捉方式
 * */

import listener from '../util/listener.js';

/**
 * @summary     全局滚动事件监听
 * @memberOf    maple.view
 * @method
 * @param       {Function}  callback
 * @return      {Object}
 * */
let scroll = (callback)=>{
		return listener.on('scroll', callback);
	}
	/**
	 * @summary     监控目标对象进出可视区
	 * @memberOf    scroll
	 * @method
	 * @param       {Element}   target
	 * @param       {Function}  callback
	 * */
	, observe = (target, callback)=>{
		if( target instanceof Element ){
			listener.on(target, 'intersectionObserver', callback);
		}
		else if( target instanceof NodeList || target instanceof HTMLCollection ){
			Array.from( target ).forEach((element)=>{
				listener.on(element, 'intersectionObserver', callback);
			});
		}
		else{
			console.log('目标非 Element、NodeList、HTMLCollection 类型对象，无法监听');
		}
	}
	/**
	 * @summary     取消监控目标对象进程可视区
	 * @memberOf    scroll
	 * @method
	 * @param       {Element}   target
	 * @param       {Function}  [callback]
	 * */
	, unobserve = (target, callback)=>{
		if( target instanceof Element ){
			listener.off(target, 'intersectionObserver', callback);
		}
		else if( target instanceof NodeList || target instanceof HTMLCollection ){
			Array.from( target ).forEach((element)=>{
				listener.off(element, 'intersectionObserver', callback);
			});
		}
		else{
			console.log('目标非 Element、NodeList、HTMLCollection 类型对象，无法监听');
		}
	}
	/**
	 * @summary 处理上、左方向的滚动量
	 * @param   {number}    curr        滚动数据
	 * @param   {string}    unit        滚动单位
	 * @param   {string}    direction   滚动方向
	 * @return  {number}
	 * */
	, _handleTopLeft = (curr, unit, direction)=>{
		if( unit === '%' ){  // 百分比
			curr = curr * scrollTarget[`scroll${direction}`] / 100;
		}
		else if( unit === 'view' ){  // 屏数
			curr = curr * doc[`client${direction}`];
		}

		return curr;
	}
	/**
	 * @summary 处理下、右方向的滚动量
	 * @param   {number}    curr        滚动数据
	 * @param   {string}    unit        滚动单位
	 * @param   {string}    direction   滚动方向
	 * @return  {number}
	 * */
	, _handleBottomRight = (curr, unit, direction)=>{
		if( unit === '%' ){  // 百分比
			curr = Math.max(scrollTarget[`scroll${direction}`] * (1 - curr / 100), 0);
		}
		else if( unit === 'view' ){  // 屏数
			curr = Math.max(scrollTarget[`scroll${direction}`] - curr * doc[`client${direction}`], 0);
		}
		else{
			curr = Math.max(scrollTarget[`scroll${direction}`] - curr, 0);
		}

		if( unit === '%' ){  // 百分比
			curr = Math.max(scrollTarget.scrollWidth * (1 - curr / 100), 0);
		}
		else if( unit === 'view' ){  // 屏数
			curr = Math.max(scrollTarget.scrollWidth - curr * doc.clientWidth, 0);
		}
		else{
			curr = Math.max(scrollTarget.scrollWidth - curr, 0);
		}

		return curr;
	}

	/**
	 * @summary     设置或读取当前页面滚动条位置
	 * @memberOf    scroll
	 * @method
	 * @param       {string}        offset  获取方位基准，取值为 'top','bottom','left','right' 中一个
	 * @param       {string|number} [value] 设置滚动条的位置
	 * @return      {Object|null}
	 * */
	, scrollBar = function(offset, value){
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
				, percent: Math.floor( curr / total * 100 )
				, view: parseFloat( (curr / view).toFixed(1) )
			};
		}
		else{   // 写 操作
			temp = regexp.exec( value );

			if( temp ){
				curr = parseFloat( temp[1] );

				switch( offset ){
					case 'top':
						curr = _handleTopLeft(curr, temp[2], 'Height');

						scrollTarget.scrollTop = curr;
						break;
					case 'bottom':
						curr = _handleBottomRight(curr, temp[2], 'Height');

						scrollTarget.scrollTop = curr;
						break;
					case 'left':
						curr = _handleTopLeft(curr, temp[2], 'Width');

						scrollTarget.scrollLeft = curr;
						break;
					case 'right':
						curr = _handleBottomRight(curr, temp[2], 'Width');

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
	}
	/**
	 * @summary     禁止页面滚动
	 * @memberOf    scroll
	 * @method
	 * @param       {boolean}   disabled
	 * */
	, disabled = (disabled)=>{
		if( disabled ){
			body.dataset.overflowState = window.getComputedStyle( body ).overflow || 'visible';

			body.style.overflow = 'hidden';
		}
		else{
			body.style.overflow = body.dataset.overflowState || 'visible';
		}
	}
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
		body.dataset.overflowState = window.getComputedStyle( body ).overflow || 'visible';

		body.style.overflow = 'hidden';
	}
	else{
		body.style.overflow = body.dataset.overflowState || 'visible';
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

scroll.observe = observe;
scroll.unobserve = unobserve;
scroll.scrollBar = scrollBar;
scroll.disabled = disabled;

export default scroll;

export const Scroll = {
	/**
	 * @summary 与 App 类约定的注入接口
	 * @param   {Base}  app
	 * @desc    注入为 $scroll
	 * */
	inject(app){
		app.inject('$scroll', scroll);
	}
};