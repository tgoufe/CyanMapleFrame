var vue = require('vue'),
	maple = require('../src/js/index'),
	slider = require('../src/js/ui/slider')
maple.slider('#indexTopSlider', {
	dataSource: 'http://coupon.test.66buy.com.cn/publics/tgAdvertise/index/list?cityId=2554',
	dataFormate: function(data) {
		var returnData = {};
		returnData.data = data.data;
		_.forEach(returnData.data, function(item) {
			item.imageUrl = 'http://test.image.51tiangou.com/' + item.imageUrl;
		})
		return returnData;
	},
	data: {
		"code": 0,
		"success": true,
		"timestamp": 1461899479687,
		"data": [{
			"id": 3571,
			"version": 11,
			"name": "【莱琪奥】全场59元起",
			"clickUrl": "http://m.test.66buy.com.cn/product/activityDetail.html?id=43631",
			"creator": "刘欢",
			"createTime": 1458718712000,
			"state": "processing",
			"startTime": 1458835200000,
			"endTime": 1462031999000,
			"imageUrl": "product/201604/05/81955084-BA8E-4F21-8BA8-007123E46D80.JPG",
			"heat": 444,
			"area": 0,
			"tgAdvertiseToCitySet": []
		}, {
			"id": 3209,
			"version": 5,
			"name": "20元红包霸气登场",
			"clickUrl": "http://m.test.66buy.com.cn/product/activityDetail.html?id=42450",
			"creator": "刘欢",
			"createTime": 1455612744000,
			"state": "processing",
			"startTime": 1455552000000,
			"endTime": 1483199999000,
			"imageUrl": "product/201604/05/3A724B2E-2099-47F1-82E9-C65066CAC696.PNG",
			"heat": 32,
			"area": 0,
			"tgAdvertiseToCitySet": []
		}, {
			"id": 3603,
			"version": 20,
			"name": "海外限时购",
			"clickUrl": "http://m.test.66buy.com.cn/overseas/qiang.html?id=43331&scp=01.m.ad03.01.f552e",
			"creator": "lixingyue",
			"createTime": 1458891862000,
			"state": "processing",
			"startTime": 1461720647000,
			"endTime": 1462031999000,
			"imageUrl": "product/201603/30/680E6202-83D5-4846-979D-31C9FBC6A743.PNG",
			"heat": 4,
			"area": 1,
			"tgAdvertiseToCitySet": []
		}, {
			"id": 2273,
			"version": 84,
			"name": "白色情人节专场",
			"clickUrl": "http://m.test.66buy.com.cn/product/activityDetail.html?id=43260&scp=01.m.ad03.01.80104",
			"creator": "lixingyue",
			"createTime": 1445995020000,
			"state": "processing",
			"startTime": 1445961600000,
			"endTime": 1483113599000,
			"imageUrl": "product/201604/05/ED2F455D-1F02-42FD-BD40-5DC5EF904104.JPG",
			"heat": 0,
			"area": 1,
			"tgAdvertiseToCitySet": []
		}]
	},
	theme: 1
})