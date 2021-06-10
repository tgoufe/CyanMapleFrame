'use strict';

import log from './util/log.js';

/**
 * @class
 * @desc    所有类的基类，实现了依赖注入功能，每个继承的应该提供一个静态的 inject 方法提供依赖注入
 * @desc    所有继承的子类提供一个名为 inject 的静态方法
 *          也可以是有 inject 方法的对象
 * @example
<pre>
class Example extends Base{
	static inject(app){
		app.inject('$example', new Example());
	}
}

class A extends Base{}
A.use( Example );
A.use({
	inject(app){
		app.inject('$test', Object);
	}
});

let a = new A()
    ;

// a.$example
// a.$test
</pre>
 * */
class Base{
	/**
	 * @constructor
	 * @param   {Object}    [options={}] 生成实例的参数，赋值给 this.$options
	 * */
	constructor(options={}){
		this.$options = options;
		this.setInjection();
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 声明依赖
	 * @static
	 * @param   {Base|Object}  module
	 * @param   {...Base|Object}
	 * */
	static use(...module){
		if( this.modules ){
			if( !this.hasOwnProperty('modules') ){
				let modules = this.modules
					;

				this.modules = new Set( Array.from(modules) );
			}
		}
		else{
			this.modules = new Set();
		}

		module.forEach((mod)=>{
			this.modules.add( mod );
		});
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary 执行注入
	 * */
	setInjection(){
		if( !this.constructor.modules ){
			return ;
		}

		this.constructor.modules.forEach((module)=>{
			module.inject && module.inject( this );
		});
	}
	/**
	 * @summary 子类继承的注入接口
	 * */
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
				, set(){
					log(`${key} 为注入接口，不能修改`);
				}
			});
		}
	}
}

export default Base;