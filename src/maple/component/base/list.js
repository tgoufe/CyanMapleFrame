export default class List{
	constructor(){
		Object.defineProperty(this,'length',{
			value:0,
			writable: true,
			enumerable: false
		})
	}
	add(arg){
		if(arg._isVue){
			this[this.length++]=arg
		}
		return this;
	}
	remove(arg){
		if(!arguments.length){
			_.forEach(this,(item,index)=>{
				item.$destroy();
				delete this[index]
			})
			this.length=0;
		}else{
			if(_.isNumber(arg)&&this[arg]){
				_.forEach(this,(item,index)=>{
					if(index===arg){
						item.$destroy();
					}else if(index>arg){
						this[index-1]=item;
					}
				})
				delete this[--this.length]
			}else if(arg._isVue){
				this.remove(_.findIndex(this,item=>item.$el===arg.$el))
			}
		}
		return this;
	}
	updata(){
		_.forEach(this,item=>_.isFunction(item)&&item.updata())
		return this;
	}
}