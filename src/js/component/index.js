var Vue = require('vue')
var _ = require('_');
var maple = require('../ns');
var Component = function(selector, options) {
	return new Component.prototype.privateInit(selector, options);
}
Component.prototype.privateInit = function(com, options) {
	var needNode=arguments[2]||true;
	var el=typeof options=='string'?options:options.el;
	options=typeof options=='object'?options:{};
	var vm=com(el,options);
	if(needNode){
		if(!options.data||options.dataSource){
			this.constructor.sendList.push(el)
			this.constructor.componentList[el]=vm;
		}
	}
}
Component.componentList={};
Component.sendList=[];
Component.init = function(url) {
	var _this=this;
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			// Success!
			var resp = request.responseText;
			resp = typeof resp == 'string' ? (new Function('return ' + resp + ';'))() : resp;
			for(var i in resp){
				_this.componentList[i].$data=json[i]
			}
		} else {
			// We reached our target server, but it returned an error
		}
	};
	request.onerror = function() {
		var json = {
			"maple-slider":{
				itemList: [{
					imageUrl: 'http://test.image.51tiangou.com/product/201604/05/3A724B2E-2099-47F1-82E9-C65066CAC696.PNG'
				}, {
					imageUrl: 'http://test.image.51tiangou.com/product/201604/05/ED2F455D-1F02-42FD-BD40-5DC5EF904104.JPG'
				}]
			},
			"#test1":{
				itemList:[{
					imageUrl: 'http://test.image.51tiangou.com/product/201604/05/3A724B2E-2099-47F1-82E9-C65066CAC696.PNG'
				}, {
					imageUrl: 'http://test.image.51tiangou.com/product/201604/05/ED2F455D-1F02-42FD-BD40-5DC5EF904104.JPG'
				},{
					imageUrl: 'http://test.image.51tiangou.com/product/201604/05/ED2F455D-1F02-42FD-BD40-5DC5EF904104.JPG'
				}]
			},
			"#shiyilist":{
				"code": 0,
				"success": true,
				"timestamp": 1463551280489,
				"itemList": [{
					"id": 425,
					"content": "#吃吃吃#吃吃吃吃吃吃吃吃喝喝喝喝喝喝喝喝喝喝喝喝喝喝喝喝喝喝喝喝喝喝喝水水水水水水水水水水水水水水水水水水水水水水水水水水水水水水嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩嫩",
					"memberId": 1,
					"createTime": 1463037142000,
					"flowerCount": 1,
					"state": 1,
					"imageUrl": "fitting/201605/12FBF0C543-144D-4A7E-94F5-136477816F31.jpg",
					"hasFlower": false,
					"commentCount": 2,
					"nickName": "lee",
					"memberImageUrl": "123.jpg",
					"friendState": 0
				}, {
					"id": 423,
					"content": "#hdhdhd#寂寞嘻嘻嘻XP新民XP明敏now姓名过敏哦搜狗你够哦搜狗你婆婆哦POS您POSpool哦咯JOJO咯SOHO哦豁不饿投一下1一追好我iOSXP我人做您1滴哦PVPXP倪敏搜去上YY",
					"memberId": 1,
					"createTime": 1463036366000,
					"flowerCount": 1,
					"state": 1,
					"imageUrl": "fitting/201605/123EA6C789-9C6D-4726-9795-26C8CA30F33E.jpg",
					"hasFlower": false,
					"commentCount": 1,
					"nickName": "lee",
					"memberImageUrl": "123.jpg",
					"friendState": 0
				}, {
					"id": 421,
					"content": "嘎拉可了客服饿了饿痛苦挪用",
					"memberId": 3691765,
					"createTime": 1463036064000,
					"flowerCount": 1,
					"state": 1,
					"imageUrl": "fitting/201605/120ABAD5CF-A443-4DC6-9385-802F320EF725.jpg",
					"hasFlower": false,
					"commentCount": 0,
					"nickName": "大花猫头鹰",
					"memberImageUrl": "head/201605/06/FC26CBE9-8CDC-4762-A812-E3D494A124E3.jpg",
					"friendState": 0
				}, {
					"id": 417,
					"content": "Kiehls",
					"memberId": 2123700,
					"createTime": 1462961941000,
					"flowerCount": 3,
					"state": 1,
					"imageUrl": "fitting/201605/11/39CCC150-2208-40B7-B093-5966C8D0CAD3.jpg",
					"hasFlower": false,
					"commentCount": 1,
					"nickName": "TG6720",
					"memberImageUrl": "head/201605/06/56F7A71D-7E80-457E-BA16-0F299930BA0D.jpg",
					"friendState": 0
				}, {
					"id": 415,
					"content": "Jiohjoighjk",
					"memberId": 1260739,
					"createTime": 1462961594000,
					"flowerCount": 5,
					"state": 1,
					"imageUrl": "fitting/201605/11/92283BAB-0237-4A12-AD66-F6B85EA56F17.jpg",
					"hasFlower": false,
					"commentCount": 0,
					"nickName": "jsjsjsjsjs",
					"memberImageUrl": "fitting/201605/17/4A330AF6-360A-4134-A79C-F5067D91FA3E.jpg",
					"friendState": 1
				}, {
					"id": 413,
					"content": "哈哈",
					"memberId": 1198737,
					"createTime": 1462932847000,
					"flowerCount": 8,
					"state": 1,
					"imageUrl": "fitting/201605/11/9A27CBB5-494B-49E8-BF62-C619A0FE7491.jpg",
					"hasFlower": false,
					"commentCount": 3,
					"nickName": "没有切莫你好好几级了",
					"memberImageUrl": "head/201605/10/825D6B27-14A3-4D18-A304-AF9AD9F0601F.jpg",
					"friendState": 0
				}, {
					"id": 405,
					"content": "Dufy",
					"memberId": 3691765,
					"createTime": 1462869215000,
					"flowerCount": 5,
					"state": 1,
					"imageUrl": "fitting/201605/10/2C75A8E3-6CE9-45AE-AC44-4446CC970FA8.jpg",
					"hasFlower": false,
					"commentCount": 0,
					"nickName": "大花猫头鹰",
					"memberImageUrl": "head/201605/06/FC26CBE9-8CDC-4762-A812-E3D494A124E3.jpg",
					"friendState": 0
				}, {
					"id": 401,
					"content": "#校花来袭#哦破坏我哄民工你明明捏秘密哦LOL哦明敏ing你们:O嗯嗯OK:-!",
					"memberId": 1,
					"createTime": 1462859372000,
					"flowerCount": 6,
					"state": 1,
					"imageUrl": "fitting/201605/10/8795B3BA-A38C-4602-9BCB-BD496F5D7748.jpg",
					"hasFlower": false,
					"commentCount": 10,
					"nickName": "lee",
					"memberImageUrl": "123.jpg",
					"friendState": 0
				}, {
					"id": 399,
					"content": "？？？？？？？？？",
					"memberId": 1260739,
					"createTime": 1462849494000,
					"flowerCount": 9,
					"state": 1,
					"imageUrl": "fitting/201605/09/5AC17181-302E-4ADF-85FA-9243BC2A5C6E.jpg",
					"hasFlower": false,
					"commentCount": 12,
					"nickName": "jsjsjsjsjs",
					"memberImageUrl": "fitting/201605/17/4A330AF6-360A-4134-A79C-F5067D91FA3E.jpg",
					"friendState": 1
				}, {
					"id": 397,
					"content": "uguvig",
					"memberId": 3691765,
					"createTime": 1462846904000,
					"flowerCount": 4,
					"state": 1,
					"imageUrl": "fitting/201605/10/5C8EA9C5-311E-4324-A624-7384F4A948F9.jpg",
					"hasFlower": false,
					"commentCount": 10,
					"nickName": "大花猫头鹰",
					"memberImageUrl": "head/201605/06/FC26CBE9-8CDC-4762-A812-E3D494A124E3.jpg",
					"friendState": 0
				}],
				"secKey": 4899
		}
		}
		for(var i in json){
			_this.componentList[i].$data=json[i]
		}
	};
	request.send();
}
Component.load=function(com){
	this.componentList.push(com);
}
Component.prototype.privateInit.prototype = Component.prototype;
module.exports = maple.component = Component;