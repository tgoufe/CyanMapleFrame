'use strict';

import maple    from '../../../src/maple/base.js';

let model = maple.model
	, ls = model.factory('ls')
	, ss = model.factory('ss')
	, cookie = model.factory('c')
	, sql = model.factory('sql')
	, idb = model.factory('idb')
	, file = model.factory('file')
	;

let addLog = (str)=>{
		let log = document.createElement('p')
			;

		log.innerHTML = str;

		document.body.appendChild( log );
	}
	;

addLog('向 localStorage 插入 /model/ls/a 的值为 1');
ls.setData('/model/ls/a', 1).then(()=>{
	ls.getData('/model/ls/a').then((value)=>{
		addLog('从 localStorage 获取到 /model/ls/a 的值为 '+ value);
	});
});

addLog('向 sessionStorage 插入 /model/ls/a 的值为 3');
ss.setData('/model/ss/a', 3).then(()=>{
	ss.getData('/model/ss/a').then((value)=>{
		addLog('从 sessionStorage 获取到 /model/ss/a 的值为 '+ value);
	});
});

addLog('向 cookie 插入 a 的值为 2');
cookie.setData('a', 2).then(()=>{
	cookie.getData('a').then((value)=>{
		addLog('从 cookie 获取到 a 的值为 '+ value);
	});
});

addLog('向 web sql database 插入 a 的值为 4');
sql.setData('a', 4).then(()=>{
	sql.getData('a').then((value)=>{
		addLog('从 web sql database 获取到 a 的值为 '+ value);
	});
});

addLog('向 indexedDB 插入 a 的值为 5');
idb.setData('a', 5).then(()=>{
	idb.getData('a').then((value)=>{
		addLog('从 indexedDB 获取到 a 的值为 '+ value);
	});
});

addLog('向 file system 插入 a 的值为 6');
file.setData('a', 6).then(()=>{
	file.getData('a').then((value)=>{
		addLog('从 file system 获取到 a 的值为 '+ value);
	});
});