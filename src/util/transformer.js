'use strict';

/**
 * @param   {string}    src
 * @param   {string}    [type='image/jpeg']
 * @param   {number}    [quality=1.0]
 * @return  {Promise<string>}
 * */
function srcToBase64(src, type='image/jpeg', quality=1.0){
	return new Promise((resolve, reject)=>{
		let img = document.createElement('img')
			, canvas = document.createElement('canvas')
			, context = canvas.getContext('2d')
			;

		img.onload = (e)=>{
			canvas.width = img.width;
			canvas.height = img.height;
			context.drawImage(img, 0, 0);

			resolve( canvas.toDataURL(type, quality) );
		};
		img.onerror = reject;

		img.crossOrigin = 'anonymous';
		img.src = src;
	});
}

/**
 * @param   {string}    str
 * @param   {string}    type
 * @return  {string}
 * */
function strToURL(str, type){
	return URL.createObjectURL( new Blob([str], {
		type
	}) );
}

export default {
	srcToBase64
	, strToURL
};

export {
	srcToBase64
	, strToURL
};