'use strict';

import maple    from '../../../src/maple/base.js';
import log      from '../log.js';

let model = maple.model
	, ls = model.factory('ls')
	, ss = model.factory('ss')
	, cookie = model.factory('c')
	, sql = model.factory('sql')
	, idb = model.factory('idb')
	, file = model.factory('file')
	;

log('向 localStorage 插入 /model/ls/a 的值为 1');
ls.setData('/model/ls/a', 1).then(()=>{
	ls.getData('/model/ls/a').then((value)=>{
		log('从 localStorage 获取到 /model/ls/a 的值为 '+ value);
	});
});
log('序列化 LocalStorageModel 对象实例', JSON.stringify( ls ));

log('向 sessionStorage 插入 /model/ls/a 的值为 3');
ss.setData('/model/ss/a', 3).then(()=>{
	ss.getData('/model/ss/a').then((value)=>{
		log('从 sessionStorage 获取到 /model/ss/a 的值为 '+ value);
	});
});
log('序列化 SessionStorageModel 对象实例', JSON.stringify( ss ));

log('向 cookie 插入 a 的值为 2');
cookie.setData('a', 2, '1d').then(()=>{
	cookie.getData('a').then((value)=>{
		log('从 cookie 获取到 a 的值为 '+ value);
	});
});
log('序列化 CookieModel 对象实例', JSON.stringify( cookie ));

log('向 web sql database 插入 a 的值为 4');
sql.setData('a', 4).then(()=>{
	sql.getData('a').then((value)=>{
		log('从 web sql database 获取到 a 的值为 '+ value);
	});
});
log('序列化 WebSQLModel 对象实例', JSON.stringify( sql ));

log('向 indexedDB 插入 a 的值为 5');
idb.setData('a', 5).then(()=>{
	idb.getData('a').then((value)=>{
		log('从 indexedDB 获取到 a 的值为 '+ value);
	});
});
log('序列化 IndexedModel 对象实例', JSON.stringify( idb ));

log('向 file system 插入 a 的值为 6');
file.setData('a', 6).then(()=>{
	file.getData('a').then((value)=>{
		log('从 file system 获取到 a 的值为 '+ value);
	});
});
log('序列化 FileSystemModel 对象实例', JSON.stringify( file ));