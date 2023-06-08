'use strict';

import maple, {Model} from '../../src/index.js';

/**
 * @class
 * @desc    对支付宝小程序中缓存接口进行封装，统一调用接口，在 Model.factory 工厂方法注册为 alipay，别名 ali、zfb、my，将可以使用工厂方法生成
 * @extends Model
 * */
class AlipayModel extends Model{
	constructor(config={}){
		super( config );

		this._config = config;

		try{
			if( 'my' in self ){
				this._enabled = true
				this._store = Promise.resolve( my );
				this._storeSync = my;
			}
			else{
				this._enabled = false;
				this._store = Promise.reject( new Error('当前未引入支付宝 sdk') );
				this._storeSync = null;
			}
		}
		catch(e){
			this._enabled = false;
			this._store = Promise.reject( new Error('当前未引入支付宝 sdk') );
			this._storeSync = null;
		}
	}

	setData(topic, value){
		let result
			;

		if( typeof topic === 'object' ){
			result = this._setByObject( topic );
		}
		else{
			result = this._store.then((store)=>{
				return new Promise((resolve, reject)=>{
					store.setStorage({
						key: topic
						, data: value
						, success(){
							super.setData(topic, value);

							resolve( true );
						}
						, fail(res){
							maple.log( res );
							reject( res );
						}
					});
				});
			});
		}

		return result;
	}

	getData(topic){
		let argc = arguments.length
			, result
			;

		if( Array.isArray(topic) ){
			result = this._getByArray( topic );
		}
		else if( argc > 1 ){
			result = this._getByArray( Array.from(arguments) );
		}
		else{
			result = this._store.then((store)=>{
				return new Promise((resolve, reject)=>{
					store.getStorage({
						key: topic
						, success(res){
							let value = res.data
								;

							if( value === null ){
								super.setData(topic, null);

								reject( null );
							}
							else{
								super.setData(topic, value);

								resolve( value );
							}
						}
						, fail(res){
							maple.log( res );
							reject( null );
						}
					});
				});
			});
		}

		return result;
	}

	removeData(topic){
		let argc = arguments.length
			, result
			;

		if( Array.isArray(topic) ){
			result = this._removeByArray( topic );
		}
		else if( argc > 1 ){
			result = this._removeByArray( Array.from(arguments) );
		}
		else{
			result = this._store.then((store)=>{
				return new Promise((resolve, reject)=>{
					store.removeStorage({
						key: topic
						, success(){
							super.removeData( topic );

							resolve( true );
						}
						, fail(res){
							maple.log( res );

							reject( false );
						}
					});
				});
			});
		}

		return result;
	}

	clearData(){
		return this._store.then((store)=>{
			store.clearStroage();

			super.clearData();

			return true;
		});
	}

	setDataSync(topic, value){
		let result = !!this._enabled
			;

		if( this._enabled ){
			try{
				if( typeof topic === 'object' ){
					Object.entries( topic ).forEach(([k, v])=>{
						this._storeSync.setStorageSync({
							key: k
							, data: v
						});

						super.setData(k, v);
					});
				}
				else{
					this._storeSync.setStorageSync({
						key: topic
						, data: value
					});

					super.setData(topic, value);
				}

				result = true;
			}
			catch(e){
				result = false;
			}
		}

		return result;
	}

	getDataSync(topic){
		let argc = arguments.length
			, keyList
			, result = null
			;

		if( this._enabled ){
			if( !Array.isArray(topic) ){
				keyList = [topic];
			}
			else if( argc > 1 ){
				keyList = Array.from( arguments );
			}
			else{
				keyList = topic;
			}

			result = keyList.reduce((all, d)=>{
				if( d in this._value ){
					all[d] = this._value[d];
				}
				else{
					let res = this._storeSync.getStorageSync({
							key: d
						})
						;

					all[d] = res.data;

					super.setData(d, all[d]);
				}
			}, {});

			if( !Array.isArray(topic) ){
				result = result[topic];
			}
		}

		return result;
	}

	catch(callback){
		if( typeof callback === 'function' ){
			this._store.catch( callback );
		}
	}

	sync = {
		setData: (...argv)=>{
			return this.setDataSync( ...argv );
		}
		, getData: (...argv)=>{
			return this.getDataSync( ...argv );
		}
	}
}

Model.register('alipay', AlipayModel);

Model.registerAlias('alipay', ['ali', 'zfb', 'zhifubao', 'my']);

export default AlipayModel;