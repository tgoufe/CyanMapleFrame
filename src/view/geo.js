'use strict';

/**
 * @file    对地理定位接口进行封装
 * */

import merge from '../util/merge.js';

/**
 * @summary     获取定位信息
 * @function    geo
 * @param       {Object}    [options={}]                        定位接口的参数
 * @param       {boolean}   [options.enableHighAccuracy=false]  是否浏览器获取高精度的位置
 * @param       {number}    [options.timeout=2000]              超时时间，单位毫秒
 * @param       {number}    [options.maximumAge=5000]           最长有效期
 * @return      {Promise<Position, PositionError>}
 * */
let geo = function(options={}){
	let result
		;

	if( 'geolocation' in navigator ){
		result = new Promise(function(resolve, reject){
			let opts = merge(options, geo.CONFIG);

			navigator.geolocation.getCurrentPosition(resolve, reject, opts);
		});
	}
	else{
		result = Promise.reject( new Error('您的浏览器不支持地理定位功能') );
	}

	return result;
};

geo.CONFIG = {
	// 指示浏览器获取高精度的位置，默认为 false
	enableHighAccuracy: true
	// 指定获取地理位置的超时时间，默认不限时，单位为毫秒
	, timeout: 2000
	// 最长有效期，在重复获取地理位置时，此参数指定多久再次获取位置
	, maximumAge: 5000
};

/**
 * @exports geo
 * */
export default geo;

export const Geo = {
	/**
	 * @summary 与 App 类约定的注入接口
	 * @param   {Object}    app
	 * @desc    注入为 $geo，配置参数名 geo
	 * */
	inject(app){
		app.inject('$geo', geo( app.$options.geo ).then(({coords={}})=>{
			let {latitude, longitude} = coords
				;

			return {
				lat: latitude
				, lon: longitude
			};
		}));
	}
};