'use strict';

import Model from './model.js';
import merge from '../util/merge.js';

const FILE_SYSTEM_CONFIG = {
		fileName: 'storage.txt'
		, fileSize: 2>>20
	}
	;

/**
 * @class
 * @classdesc
 * @extends     Model
 * */
class FileSystemModel extends Model{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * */
	constructor(config={}){
		super( config );

		this._config = merge(config, FileSystemModel._CONFIG);

		this._fs = new Promise((resolve, reject)=>{
			if( 'webkitPersistentStorage' in navigator ){
				navigator.webkitPersistentStorage.requestQuota(this.config.fileSize, (grantedBytes)=>{
					self.webkitRequestFileSystem(self.PERSISTENT, grantedBytes, (fs)=>{
						resolve( fs );
					});
				});
			}
			else{
				reject( new Error('此浏览器不支持 Local File System') );
			}
		});
	}

	// ---------- 静态属性 ----------
	/**
	 * @summary 默认配置
	 * @static
	 * @const
	 * */
	static get _CONFIG(){
		return FILE_SYSTEM_CONFIG;
	}

	// ---------- 公有方法 ----------
	setData(topic, value){
		return this._fs.then((fs)=>{
			return new Promise((resolve, reject)=>{
				fs.root.getFile(this._config.fileName, {
					create: true
				}, (fileEntry)=>{
					fileEntry.createWriter((fileWriter)=>{
						let blob = new Blob([value], {
								type: 'text/plain'
							})
							;

						fileWriter.onwriteend = function(e){
							resolve( true );
						};
						fileWriter.onerror = function(e){
							console.log( e );
							reject( e );
						};

						fileWriter.write( blob );
					}, (e)=>{
						console.log( e );
						reject( e );
					});
				});
			});
		});
	}

	getData(topic){
		return this._fs.then((fs)=>{
			return new Promise((resolve, reject)=>{
				fs.root.getFile(this._config.fileName, {}, function(fileEntry){
					fileEntry.file((file)=>{
						let fileReader = new FileReader()
							;

						fileReader.onload = function(e){
							resolve( e.target.result );
						};
						fileReader.onerror = function(e){
							console.log( e );
							reject( e );
						};

						fileReader.readAsText( file );
					});
				});
			});
		});
	}

	removeData(){}

	clearData(){
		return this._fs.then((fs)=>{
			return new Promise((resolve, reject)=>{
				fs.root.getFile(this._config.fileName, {create: false}, (fileEntry)=>{
					fileEntry.file(function(file){
						file.remove(()=>{
							resolve( true );
						});
					});
				});
			});
		});
	}
	/**
	 * @summary 获取文件存储使用状况
	 * @return  {Promise}   返回一个 Promise 对象，在 resolve 时传回查询结果
	 * @desc    返回结果为一个对象，包括 usage、all、percent 属性，对应为 已使用字节数、总字节数、已用百分比
	 * */
	getUsage(){
		return new Promise((resolve, reject)=>{
			navigator.webkitPersistentStorage.queryUsageAndQuota((usage, quota)=>{
				resolve({
					usage
					, all: quota
					, percent: (usage / quota *100) +'%'
				});
			});
		});
	}
}