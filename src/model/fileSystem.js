'use strict';

import Model from './model.js';
import merge from '../util/merge.js';
import log   from '../util/log.js';

/**
 * 默认配置
 * @const
 * */
const FILE_SYSTEM_CONFIG = {
		fileName: 'storage.txt'
		, fileSize: 2>>20
		, fileType: 1           // 0 为临时文件，1 为持久文件
	}
	;

/**
 * @class
 * @desc    对 File System 进行封装，统一调用接口，在 Model.factory 工厂方法注册为 file，别名 fs，将可以使用工厂方法生成。默认使用文件名为 storage.txt，2MB 空间
 * @extends Model
 * */
class FileSystemModel extends Model{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * @param   {string}    [config.fileName]
	 * @param   {number}    [config.fileSize]
	 * @param   {number}    [config.fileType]   文件的保存类型，0 为临时文件，1 为持久文件，可以使用 FileSystemModel.TEMPORARY 和 FileSystemModel.PERSISTENT 来替代
	 * @param   {string}    [config.eventType]
	 * */
	constructor(config={}){
		config = merge(config, FileSystemModel.CONFIG);

		super( config );

		this._config = config;

		this._fs = new Promise((resolve, reject)=>{
			let requestFileSystem = self.requestFileSystem || self.webkitRequestFileSystem || null
				;

			// if( 'webkitPersistentStorage' in navigator ){
			// 	navigator.webkitPersistentStorage.requestQuota(this.config.fileSize, (grantedBytes)=>{
			// 		self.webkitRequestFileSystem(self.PERSISTENT, grantedBytes, (fs)=>{
			// 			resolve( fs );
			// 		});
			// 	});
			// }
			if( !requestFileSystem ){
				reject( new Error('此浏览器不支持 Local File System') );
				return ;
			}

			requestFileSystem(self.PERSISTENT, this._config.fileSize, resolve, reject);
		});
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 与 App 类约定的注入接口
	 * @static
	 * @param   {Base}      app
	 * @param   {Object}    app.$options
	 * @param   {Object}    [app.$options.fs]
	 * @desc    注入为 $fs，配置参数名 fs
	 * */
	static inject(app){
		app.inject('$fs', new FileSystemModel( app.$options.fs ));
	}

	// ---------- 静态属性 ----------
	/**
	 * @summary 默认配置
	 * @override
	 * @static
	 * @const
	 * */
	static get CONFIG(){
		return FILE_SYSTEM_CONFIG;
	}
	/**
	 * @summary 持久化文件类型的值
	 * @static
	 * */
	static get PERSISTENT(){
		return self.PERSISTENT;
	}
	/**
	 * @summary 临时文件类型的值
	 * @static
	 * */
	static get TEMPORARY(){
		return self.TEMPORARY;
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary 获取 FileEntry 对象
	 * @private
	 * @param   {Object}    [options={}]
	 * @param   {boolean}   [options.create]    是否创建文件
	 * @return  {Promise<FileSystemFileEntry>}  返回一个 Promise 对象，在 resolve 时传回 fileEntry 对象
	 * */
	_getFileEntry(options={}){
		return this._fs.then((fs)=>{
			return new Promise((resolve, reject)=>{
				fs.root.getFile(this._config.fileName, options, resolve, reject);
			});
		});
	}
	/**
	 * @summary 获取 FileWriter 对象
	 * @private
	 * @param   {FileSystemFileEntry}   fileEntry
	 * @return  {Promise<FileWriter>}   返回一个 Promise 对象，在 resolve 时传回 fileWriter 对象
	 * */
	_getFileWriter(fileEntry){
		return new Promise((resolve, reject)=>{
			fileEntry.createWriter(resolve, reject);
		});
	}
	/**
	 * @summary 向文件写入内容
	 * @private
	 * @param   {FileWriter}    fileWriter
	 * @param   {string}        content
	 * @return  {Promise<boolean, ErrorEvent>}   返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	_writeFile(fileWriter, content){
		return new Promise((resolve, reject)=>{
			let blob = new Blob([content], {
					type: 'text/plain'
				})
				;

			fileWriter.onwriteend = function(){
				resolve( true );
			};
			fileWriter.onerror = function(e){
				log( e );
				reject( e );
			};

			fileWriter.write( blob );
		});
	}
	/**
	 * @summary 向文件写入内容
	 * @private
	 * @param   {string}    content
	 * @return  {Promise<boolean>}  返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	_write(content){
		return this._getFileEntry().then((fileEntry)=>{
			log(`写入文件 ${fileEntry.toURL()}`);
			return this._getFileWriter( fileEntry );
		}).then((fileWriter)=>{
			return this._writeFile(fileWriter, content);
		}).then(()=>{
			return true;
		});
	}
	/**
	 * @summary 获取文件对象
	 * @private
	 * @param   {FileSystemFileEntry}   fileEntry
	 * @return  {Promise<File>}         返回一个 Promise 对象，在 resolve 时传回 file 对象
	 * */
	_getFile(fileEntry){
		return new Promise((resolve, reject)=>{
			return fileEntry.file(resolve, reject);
		});
	}
	/**
	 * @summary 读取文件内容
	 * @private
	 * @param   {File}      file
	 * @return  {Promise<string, ErrorEvent>}    返回一个 Promise 对象，在 resolve 时传回文件内容字符串
	 * */
	_readFile(file){
		return new Promise((resolve, reject)=>{
			let fileReader = new FileReader()
				;

			fileReader.onload = function(e){
				resolve( e.target.result );
			};
			fileReader.onerror = function(e){
				log( e );
				reject( e );
			};

			fileReader.readAsText( file );
		});
	}
	/**
	 * @summary 获取文件的全部内容
	 * @private
	 * @return  {Promise<Object, Error>}    返回一个 Promise 对象，在 resolve 时传回对文件内容解析后的 JSON 对象
	 * */
	_read(){
		return this._getFileEntry({
			create: true
		}).then((fileEntry)=>{
			log(`读取文件 ${fileEntry.toURL()}`);
			return this._getFile( fileEntry );
		}).then((file)=>{
			return this._readFile( file );
		}, (e)=>{
			log( e );

			return '{}';
		}).then((content)=>{
			content = content || '{}';

			try{
				content = JSON.parse( content );

				return content;
			}
			catch(e){
				log( e );
				return Promise.reject( e );
			}
		});
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary 设置数据
	 * @override
	 * @param   {string|Object} topic
	 * @param   {*}             value
	 * @return  {Promise<boolean>}       返回一个 Promise 对象，在 resolve 时传回 true
	 * @desc    保持值得时候，同时会保持在内存中
	 * */
	setData(topic, value){
		let result
			, writeTarget
			;

		if( typeof topic === 'object' ){
			writeTarget = topic;
		}
		else if( typeof topic === 'string' ){
			writeTarget = {
				[topic]: value
			};
		}

		if( writeTarget ){

			Object.entries( writeTarget ).forEach(([k, v])=>{
				super.setData(k, v);
			});

			result = this._read().then((content)=>{
				return merge(writeTarget, content);
			}).then((content)=>{
				return this._write( JSON.stringify(content) );
			});
		}
		else{
			result = Promise.reject( new Error('参数错误') );
		}

		return result;
	}
	/**
	 * @summary 获取数据
	 * @override
	 * @param   {string|string[]}   topic
	 * @param   {...string}
	 * @return  {Promise<*, null>}  返回一个 Promise 对象，若存在 topic 的值，在 resolve 时传回查询出来的 value，否则在 reject 时传回 null
	 * @desc    获取数据时会优先从内存中取值，若没有则从 file system 中取值并将其存入内存中，当 topic 的类型为数组的时候，resolve 传入的结果为一个 json，key 为 topic 中的数据，value 为对应查找出来的值
	 * */
	getData(topic){
		let argc = arguments.length
			, topicList
			, readCache = null      // 读取文件结果缓存
			, getReadCache = ()=>{  // 执行读取文件操作
				return this._read();
			}
			;

		if( Array.isArray(topic) ){
			topicList = topic;
		}
		else if( argc > 1 ){
			topicList = [].slice.call( arguments );
		}
		else{
			topicList = [topic];
		}

		return Promise.all( topicList.map((t)=>{
			return super.getData(t).catch(()=>{
				if( !readCache ){   // 没有缓存，获取缓存
					readCache = getReadCache();
				}

				return readCache.then((content)=>{
					return content[t] || null;
				});
			});
		}) ).then((data)=>{
			let result
				;
			
			if( Array.isArray( topic ) || argc > 1 ){
				result = topicList.reduce((rs, d, i)=>{
					rs[d] = data[i];

					return rs;
				}, {});
			}
			else{
				result = data[0];
			}

			return result;
		});
	}
	/**
	 * @summary 将数据从缓存中删除
	 * @override
	 * @param   {string|string[]}   topic
	 * @param   {...string}
	 * @return  {Promise<boolean, Error>}   返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	removeData(topic){
		let argc = arguments.length
			, topicList
			;

		if( Array.isArray(topic) ){
			topicList = topic;
		}
		else if( argc > 1 ){
			topicList = [].slice.call( arguments );
		}
		else{
			topicList = [topic];
		}

		topicList.forEach((t)=>{
			return super.removeData( t );
		});

		return this._read().then((content)=>{
			return topicList.reduce((all, t)=>{
				delete all[t];

				return all;
			}, content);
		}).then((content)=>{
			return this._write( JSON.stringify(content) );
		});
	}
	/**
	 * @summary 清空数据
	 * @override
	 * @return  {Promise}   返回一个 Promise 对象
	 * @desc    删除文件
	 * */
	clearData(){
		return super.clearData().then(()=>{
			return this._getFileEntry({
				create: false
			});
		}).then((fileEntry)=>{
			return new Promise((resolve, reject)=>{
				log(`${fileEntry.toURL()} 文件被删除`);

				fileEntry.remove(resolve, reject);
			});
		});
	}
	/**
	 * @summary 获取文件存储使用状况
	 * @return  {Promise<Object>}   返回一个 Promise 对象，在 resolve 时传回查询结果
	 * @desc    返回结果为一个对象，包括 usage、all、percent 属性，对应为 已使用字节数、总字节数、已用百分比
	 * */
	getUsage(){
		return new Promise((resolve)=>{
			navigator.webkitPersistentStorage.queryUsageAndQuota((usage, quota)=>{
				resolve({
					usage
					, all: quota
					, percent: (usage / quota *100) +'%'
				});
			});
		});
	}

	/**
	 * @summary 类构造失败时的回调接口
	 * @param   {Function}  callback
	 * */
	catch(callback){
		if( typeof callback === 'function' ){
			this._fs.catch( callback );
		}
	}
}

/**
 * 在 Model.factory 工厂方法注册，将可以使用工厂方法生成
 * */
Model.register('file', FileSystemModel);
/**
 * 注册别名
 * */
Model.registerAlias('file', ['fs']);

export default FileSystemModel;