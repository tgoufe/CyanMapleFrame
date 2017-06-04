import sliderVue from './slider.vue';
import sliderItemVue from './slider-item.vue';
import Swiper from './swiper';
import sliderList,{CMUI_SliderList} from './sliderList';
import sliderThemeList from './sliderThemeList'
Vue.component('cmui-slider',sliderVue);
Vue.component('cmui-slider-item',sliderItemVue);
function Slider(){
	if(arguments.length){
		var argParent;
		var argStrings=_.filter(arguments,item=>{
			if(_.isString(item)){
				if(item[0]!='.'||item[0]!='#'){
					argParent=item;
					return false;
				}
				return true;
			}
			return _.isNumber(item)
		});
		var argObject=_.filter(arguments,_.isPlainObject)[0];
		var argFunction=_.filter(arguments,_.isFunction)[0];
		var tempSliderList=new CMUI_SliderList();
		//只有一个选择器的情况
		if(argParent&&arguments.length==1){
			_.filter(sliderList,(value,key)=>{
				var container=_.get(value,'container');
				if(!container){
					return false;
				}else if(argParent[0]=='#'){
					return container[0].id==argParent.slice(1)
				}
				else{
					return container.hasClass(argParent.slice(1))
				}
			}).forEach(item=>tempSliderList.add(item))
			return tempSliderList;
		}
		var defaultOptions={
			parent:argParent||'body',
			items:(function(){
				if(argFunction){
					var rs=argFunction();
					if(_.isArray(rs)){
						return rs;
					}else{
						return [];
					}
				}else{
					return argStrings.length?argStrings:[]
				}
			})(),
			id:_.uniqueId('cmui-slider_'),
			options:null,
			theme:''
		}
		
		var options=_.assign(defaultOptions,argObject);
		var parent=$(options.parent).eq(0);
		if(!parent.length){
			return sliderList;
		}
		var tpl='';
		debugger
		tpl+='<div class="cmui-slider" id="'+options.id+'">';
		tpl+='	<div class="swiper-container" >';
		tpl+='		<div class="swiper-wrapper">';
		options.items.forEach(item=>{
			tpl+='<div class="swiper-slide">'
			tpl+=item.toString();
			tpl+='</div>'
		})
		tpl+='		</div>';
		tpl+='	    <div class="pagination"></div>';
		tpl+='	</div>';
		tpl+='</div>';
		var dom =$(tpl)
		parent.append(dom);
		//主题拓展
		if(options.theme){
			_.defaults(options.options,sliderThemeList[options.theme])
		}
		var swiper=new Swiper($('.swiper-container',dom),options.options)
		sliderList.add(swiper);
		return tempSliderList.add(swiper);
	}else{
		return sliderList; 
	}
	// if(typeof arg=='string'){
	// 	return _.filter(sliderList,(value,key)=>{
	// 		value.container=arg//error
	// 	})
	// }else if(typeof arg=='object'){
	// 	var options=_.assign({
	// 		parent:'body',
	// 		items:null,
	// 		options:null,
	// 		id:_.uniqueId('cmui-slider_')
	// 	},arg)
	// 	var parent=$(options.parent);
	// 	if(parent.length&&(_.isArray(options.items)||_.isFunction(options.items))){
	// 		var tpl='';
	// 		tpl+='<div class="cmui-slider" id="'+options.id+'">';
	// 		tpl+='	<div class="swiper-container" >';
	// 		tpl+='		<div class="swiper-wrapper">';
	// 		if(_.isArray(options.items)){
	// 			options.items.forEach(item=>{
	// 				tpl+='<div class="swiper-slide">'
	// 				tpl+=item.toString();
	// 				tpl+='</div>'
	// 			})
	// 		}
	// 		tpl+='		</div>';
	// 		tpl+='	    <div class="pagination"></div>';
	// 		tpl+='	</div>';
	// 		tpl+='</div>';
	// 		var dom =$(tpl)
	// 		parent.append(dom);
	// 		sliderList.add(new Swiper($('.swiper-container',dom),options.options));
	// 	}
	// }else if(typeof arg=='number'){
	// 	return arg>=sliderList.length?undefined:sliderList[arg]
	// }else{
	// 	return sliderList;
	// }
}
export default Slider