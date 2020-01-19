'use strict';

/**
 * @class
 * @desc    所有类的基类，实现了依赖注入功能，每个继承的应该提供一个静态的 inject 方法提供依赖注入
 * */
class Base{
	constructor(options={}){
		this.$options = options;
		this.setInjection();
	}

	static use(...module){
		if( !this.modules ){
			this.modules = new Set();
		}

		module.forEach((mod)=>{
			this.modules.add( mod );
		});
	}

	setInjection(){
		if( !this.constructor.modules ){
			return ;
		}

		this.constructor.modules.forEach((module)=>{
			module.inject && module.inject( this );
		});
	}

	inject(key, module){
		if( key in this ){
			throw new Error(`${key} 已经注入，不能重复注入`);
		}
		else{
			Object.defineProperty(this, key, {
				enumerable: true
				, get(){
					return module;
				}
			})
		}
	}
}

export default Base;