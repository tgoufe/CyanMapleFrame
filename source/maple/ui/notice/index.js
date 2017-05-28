import noticeVue from "./index.vue";
// var CURRENT = null
// 	, timer1 = null
// 	, timer2 = null;
// var tpl = `<div class="mask mask-transparent center" @click="remove()">
//     <div class="notice">
//         <i v-show="iconName" class="icon-{{iconName}}"></i>
//         <div v-text="text"></div>
//     </div>
// </div>`;

// function Notice(string,iconName,autoCloseTime){
// 	if(!arguments.length){
// 		return CURRENT
// 	}
// 	document.body.classList.add('overflow-h');
// 	autoCloseTime=typeof autoCloseTime=='number'?autoCloseTime:2000;
// 	if( CURRENT ){
// 		CURRENT.$destroy(true);
// 		timer1 && clearTimeout( timer1 );
// 		timer2 && clearTimeout( timer2 );
// 	}

// 	CURRENT = new Vue({
// 		el:document.body.appendChild(document.createElement('div')),
// 		template:tpl,
// 		data:{
// 			iconName:iconName,
// 			text:string
// 		},
// 		methods:{
// 			remove:function(){
// 				this.$destroy(true);
// 				CURRENT = null;
// 				document.body.classList.remove('overflow-h')
// 			}
// 		}
// 	});
// 	if(autoCloseTime>0){
// 		timer1 = setTimeout(function(){
// 			if( CURRENT ){
// 				CURRENT.$el.classList.add('an', 'an-out');
// 			}
// 			timer1 = null;
// 		}, autoCloseTime);
// 		timer2 = setTimeout(function(){
// 			if( CURRENT ){
// 				CURRENT.remove();
// 			}

// 			CURRENT = null;
// 			timer2 = null;
// 		}, autoCloseTime+1000);
// 	}
// }
var defaults = {
	  title: ''
	, content: ''
	, className: ''
	, timeout: 3000
	, okFn:function(){}
};
Vue.component('cmui-notice',noticeVue);
var id='cmui-notice-'+_.uniqueId();
var CURRENT=null;
var timeHandle;
$(function(){
	$('<cmui-notice id="'+id+'">').appendTo('body');
	CURRENT=new Vue({
		el:'#'+id
	}).$children[0];
})

function Notice(){
	var options={};
	if(arguments){
		if(arguments.length>1){
			options.okFn=_.filter(arguments,_.isFunction)[0];
			var stringList=_.filter(arguments,item=>(typeof item).match(/string|number|boolean/)).map(item=>item.toString())
			options.content=stringList[0];
			if(stringList.length>1){
				options.timeout=_.last(_.filter(arguments,_.isNumber))|0;
			}
		}else{
			if( (typeof arguments[0]).match(/string|number|boolean/)){
				options.content=arguments[0]
			}else if(_.isObject(arguments[0])){
				options=arguments[0];
			}else{
				return CURRENT
			}
		}
	}else{
		return CURRENT
	}
	options = _.defaults(options, defaults);
	document.body.classList.add('overflow-h');
	CURRENT.showCmuiDialog=true;
	_.each(options,(value,key)=>{
		CURRENT[key]=value
	})
	timeHandle&&clearTimeout(timeHandle)
	if(options.timeout){
		timeHandle=setTimeout(()=>{
			clearTimeout(timeHandle)
			CURRENT.cancel();
		}, options.timeout);
	}
};
export default Notice;