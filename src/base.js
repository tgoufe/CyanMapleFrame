'use strict';

const MODULE_LIST = new Map()
	;

class Base{
	constructor(options={}){
		this.$options = options;
		this.setInjection();
	}

	static use(module){
		if( !this.modules.has(this) ){
			this.modules.set(this, []);
		}

		this.modules.get( this ).push( module );
	}

	static get modules(){
		return MODULE_LIST;
	}

	setInjection(){
		this.constructor.modules.get( this.constructor ).forEach((module)=>{
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