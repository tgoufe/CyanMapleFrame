var Vue=require('vue');
var _=require('_');
var Swiper=require('swiper');
var tpl=require('./tpl/slider/theme1.html');
// var component=require('../component/index');
function Slider(selector,options){
	return new Slider.prototype.init(selector,options)
}
Slider.prototype.init=function(selector,options){
	var vm=new Vue({
		el: selector,
		template:tpl,
		data:null,
		watch:{
			data:function(newData,oldData){
				new Swiper(this.$el,{
					pagination : '.swiper-pagination'
				})
			}
		},
		methods:{
			itemEvent:function(index,event){
				console.dir(arguments)
			}
		}
	})
	if(options===undefined){
		
	}else{
		if(options.dataSource){
			var request = new XMLHttpRequest();
			request.open('GET', options.dataSource, true);
			request.onload = function() {
			  if (request.status >= 200 && request.status < 400) {
			    // Success!
			    var resp = request.responseText;
			    if(typeof options.dataFormate==='function' ){
			    	vm.$data=options.dataFormate((new Function('return '+resp +';'))())
			    }else{
			    	vm.$data=(new Function('return '+resp +';'))();
			    }
			  } else {
			    // We reached our target server, but it returned an error
			  }
			};
			request.onerror = function() {
			  // There was a connection error of some sort
			};
			request.send();
		}else if(options.data){
			if(typeof options.dataFormate==='function' ){
				vm.$data=options.dataFormate(options.data)
				console.log(options.data)
			}else{
				vm.$data=options.data
				console.log(options.data)
			}
		}
	}
	return vm;
	// return new Swiper(selector, options)
}
Slider.prototype.init.prototype=Slider.prototype;
module.exports = Slider;