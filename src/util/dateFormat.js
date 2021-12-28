'use strict';

/**
 * @file    时间格式处理函数
 * */

import tools from './tools.js';

/**
 * @summary     时间格式处理函数
 * @function    dateFormat
 * @memberOf    maple.util
 * @param       {Date}      [date=new Date()]
 * @param       {string}    [format='YYYY-MM-DD']
 * @return      {string}
 * */
let dateFormat = function(date=new Date(), format='YYYY-MM-DD'){
		let keys = Object.keys( dateFormat._dateStrReplace )
			, expr = new RegExp(`(${keys.join('|')})`, 'g')
			;

		return format.replace(expr, function(str){
			return dateFormat._dateStrReplace[str]( date );
		});
	}
	;

/**
 * 时间格式字符串替换函数集合
 * */
dateFormat._dateStrReplace = {
	/**
	 * @summary 替换 YYYY
	 * @param   {Date}      date
	 * @return  {string}
	 * */
	YYYY(date){
		return date.getFullYear() +'';
	}
	/**
	 * @summary 替换 YY
	 * @param   {Date}      date
	 * @return  {string}
	 * */
	, YY(date){
		return (date.getFullYear() +'').slice(2);
	}
	/**
	 * @summary 替换 MM
	 * @param   {Date}      date
	 * @return  {string}
	 * */
	, MM(date){
		return tools.fillZero(date.getMonth() +1, 2);
	}
	/**
	 * @summary 替换 DD
	 * @param   {Date}      date
	 * @return  {string}
	 * */
	, DD(date){
		return tools.fillZero(date.getDate(), 2);
	}
	/**
	 * @summary 替换 hh
	 * @param   {Date}      date
	 * @return  {string}
	 * */
	, hh(date){
		return tools.fillZero(date.getHours(), 2);
	}
	/**
	 * @summary 替换 mm
	 * @param   {Date}      date
	 * @return  {string}
	 * */
	, mm(date){
		return tools.fillZero(date.getMinutes(), 2);
	}
	/**
	 * @summary 替换 ss
	 * @param   {Date}      date
	 * @return  {string}
	 * */
	, ss(date){
		return tools.fillZero(date.getSeconds(), 2);
	}
	/**
	 * @summary 替换 www
	 * @param   {Date}      date
	 * @return  {string}
	 * */
	, www(date){
		return dateFormat.WEEK_EN[date.getDay()].slice(0, 3);
	}
	/**
	 * @summary 替换 week
	 * @param   {Date}      date
	 * @return  {string}
	 * */
	, week(date){
		return dateFormat.WEEK_EN[date.getDay()];
	}
	/**
	 * @summary 替换星期
	 * @param   {Date}      date
	 * @return  {string}
	 * */
	, ['星期'](date){
		return '星期'+ dateFormat.WEEK_CN[date.getDay()];
	}
	/**
	 * @summary 替换周
	 * @param   {Date}      date
	 * @return  {string}
	 * */
	, ['周'](date){
		return '周'+ dateFormat.WEEK_CN[date.getDay()];
	}
};

/**
 * @summary 将字符串或数字转成毫秒数
 * @param   {number|string} str
 * @param   {string}        [unit='d']
 * @return  {number}
 * @desc    支持复合式的时间格式，如：
 *          1d5h === 1 天 5 小时
 *          -1y2m === 过去 1 年 2 分钟
 *          对时间单位并不要求唯一，也没有顺序要求，只是对每个可解析的时间进行相加，如
 *          1y3y === 4y
 *          1m2y === 2y1m
 *          1d2m1y1m === 1y1d3m
 * */
dateFormat.formatTimeStr = function(str, unit='d'){
	let result = 0
		, temp
		, flag
		, dateStr
		, keys = Object.keys( dateFormat._SHORT_TIME_NUM ).join('')
		, shortTimeExpr = new RegExp(`^(-?)((?:\\d+[${keys}]?)+)$`, 'i')
		;

	if( typeof str === 'number' ){
		if( unit && unit in dateFormat._SHORT_TIME_NUM ){
			result = str * dateFormat._SHORT_TIME_NUM[unit];
		}
		else{
			result = str;
		}
	}
	else if( typeof str === 'string' && (temp = shortTimeExpr.exec(str)) ){
		flag = !!temp[1];   // 负号
		dateStr = temp[2];

		let expr = new RegExp(`((\\d+)([${keys}])?)`, 'ig')
			;

		while( temp = expr.exec(dateStr) ){
			result += Number( temp[2] ) * (dateFormat._SHORT_TIME_NUM[temp[3]] || 1);
		}

		result = flag ? -result : result;
	}
	
	return result;
};

/**
 * 英文一周名称
 * @static
 * */
dateFormat.WEEK_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * 中文一周名称
 * @static
 * */
dateFormat.WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 时间单位对应的毫秒数
 * @static
 * @private
 * @const
 * */
dateFormat._SHORT_TIME_NUM = {
	s: 1e3
	, m: 6e4
	, h: 36e5
	, d: 864e5
	, y: 31536e6
};

export default dateFormat;