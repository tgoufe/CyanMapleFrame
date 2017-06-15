function CMUI_ListList(){
	this.length=0;
}
CMUI_ListList.prototype.add=function(item){
	//类型判断暂时没加
	this[this.length++]=item;
	return this;
}
CMUI_ListList.prototype.remove=function(){
	_.times(this.length,index=>{
		// var swiper=this[index];
		// if(swiper instanceof Swiper){
		// 	var container=swiper.container;
		// 	var baseIndex=_.findKey(sliderList,swiper)
		// 	swiper.destroy(false, true);
		// 	container.remove();
		// 	this[index]=null
		// 	if(this!=sliderList){
		// 		sliderList[baseIndex]=null
		// 	}
		// }
	})
	return this;
}
CMUI_ListList.prototype.eq=function(index=0){
	var temp=new CMUI_ListList();
	return temp.add(this[index])
}
var listList=new CMUI_ListList;
export  {CMUI_ListList,listList as default};