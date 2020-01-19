'use strict';

/**
 * @file    view    视图功能聚合
 * */

import url      from '../runtime/url.js';
import listener from '../util/listener.js';

import scroll, {Scroll} from './scroll.js';

import error    from './error.js';

import unHandledRejection   from './unHandledRejection.js';

import postMessage  from './postMessage.js';

import vibrate, {clearVibrate}  from './vibrate.js';

import geo, {Geo}   from './geo.js';

import notify, {Notify} from  './notify.js';

let needRefreshOn = false
	/**
	 * @summary     设置页面回退时刷新该页面
	 * @function
	 * @memberOf    maple.view
	 * @desc        当 Chrome 由当前页面跳转到下一页面后，浏览回退到当前页面时，页面不会刷新，调用此函数以达成刷新页面的效果
	 * */
	, needRefresh = ()=>{
		if( needRefreshOn ){
			return ;
		}

		eventList.pageshow.add(()=>{
			eventList.pagehide.add(()=>{
				url.reload();
			});
		});

		needRefreshOn = true;
	}
	/**
	 * @summary     获取节点的方位、大小信息
	 * @function
	 * @memberOf    maple.view
	 * @param       {Element}       target
	 * @param       {string}        [key]
	 * @return      {Object|number}
	 * */
	, offset = (target, key)=>{
		let rs = null
			;

		if( 'getBoundingClientRect' in target ){
			rs = target.getBoundingClientRect();

			if( key ){
				rs = rs[key];
			}
		}

		return rs;
	}

	/**
	 * @namespace   maple.view.eventList
	 * @summary     预定义事件
	 * */
	, eventList = {
		scroll
		, resize(callback){
			listener.on('resize', callback);
		}
		, devicemotion(callback){
			listener.on('devicemotion', callback);
		}

		, error

		, unHandledRejection

		, pageshow(callback){
			listener.on('pageshow', callback);
		}
		, pagehide(callback){
			listener.on('pagehide', callback);
		}

		, message(callback){
			listener.on('message', callback);
		}

		, visibilitychange(callback){
			listener.on('visibilitychange', callback);
		}

		, online(callback){
			listener.on('online', callback);
		}
		, offline(callback){
			listener.on('offline', callback);
		}


		, beforeunload(callback){
			listener.on('beforeUnload', callback);
		}
		, unload(callback){
			listener.on('unload', callback);
		}

		/**
		 * focus 和 blur 事件应该注意防止捕获冒泡的方式触发
		 * */
		, focus(callback){
			listener.on('focus', callback);
		}
		, blur(callback){
			listener.on('blur', callback);
		}
	}
	;


/**
 * @namespace   maple.view
 * */
let view = {
		eventList
		, ...eventList

		, needRefresh

		, postMessage

		, vibrate
		, clearVibrate

		, offset

		, geo

		, notify
	}
	;

/**
 * @exports view
 * */
export default view;

export const View = {
	/**
	 * @summary 与 App 类约定的注入接口
	 * @param   {Object}    app
	 * @desc    注入为 $view
	 * */
	inject(app){
		app.inject('$view', view);
	}
};

export {
	Geo
	, Notify
	, Scroll
};