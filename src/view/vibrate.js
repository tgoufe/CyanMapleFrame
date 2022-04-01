'use strict';

/**
 * @memberOf    maple.view
 * @summary     使设备（有震动硬件）产生有频率的震动
 * @param       {number|number[]}   pattern 提供一个震动、暂停间隔的模式。每一个值表示交替震动或者暂停的毫秒数。你可以提供一个单个的值（震动一次的毫秒数）或者一个包含整数的数组来交替的震动、暂停、震动
 * @param       {...number}
 * @return      {boolean}
 * @desc        传递一个 0、一个空数组或者一个元素全部为 0 的数组会结束当前正在运行中的震动模式
 * */
let vibrate = function(pattern){
		let argc = arguments.length
			;

		if( navigator.vibrate ){
			if( argc > 1 ){
				return navigator.vibrate( Array.from(arguments) );
			}
			else{
				return navigator.vibrate( pattern );
			}
		}
		else{
			return false;
		}
	}
	, clearVibrate = function(){
		vibrate( 0 );
	}
	;

export default vibrate;

export {
	clearVibrate
}