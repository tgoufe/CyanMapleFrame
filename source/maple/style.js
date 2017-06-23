var cmuiStyle;
var cssRules;
var cssRulesLen;
$(function(){
	cmuiStyle = document.createElement('style');
	document.head.appendChild(cmuiStyle);
	// cmuiStyle.sheet.insertRule("body{}", 0);
	// cmuiStyle.sheet.cssRules[0].style.backgroundColor='red'
	cssRules=_.get(cmuiStyle,'sheet.cssRules');
	cssRulesLen=cssRules.length;
})
function setStyle(){

}
function style(){
	if(arguments.length){
		let argStringList=_.filter(arguments,_.isString);
		let selector=_.get(argStringList,0);
		let name=_.camelCase(_.get(argStringList,1));
		let value=_.get(argStringList,2);
		let argObject=_.find(arguments,_.isPlainObject);
		selector=_.get(argObject,'selector')||selector;
		name=_.camelCase(_.get(argObject,'name'))||name;
		value=_.get(argObject,'value')||value;
		if(selector&& name&& value){//设置样式
			let matchRule=_.findLast(cssRules,item=>_.get(item,'selectorText')==selector);
			if(matchRule){
				matchRule.style[name]=value;
			}else{
				cmuiStyle.sheet.insertRule(selector+'{}', cssRulesLen);
				cmuiStyle.sheet.cssRules[cssRulesLen++].style[name]=value
			}
		}else if(selector&& name){//读取样式
			let matchRule=_.findLast(cssRules,item=>_.get(item,'selectorText')==selector);
			return _.get(matchRule,'style['+name+']')
		}
	}
	console.dir(cmuiStyle.sheet)
	return cmuiStyle;
}
export default style;
//body background red
//selector styleObj
//selector