!function(e, t){
	if( "object" == typeof exports && "object" == typeof module ) module.exports = t();else if( "function" == typeof define && define.amd ) define([], t);else{
		var n = t();
		for(var i in n) ("object" == typeof exports ? exports : e)[i] = n[i]
	}
}(this, function(){
	return webpackJsonp([0], {
		44: function(e, t, n){
			e.exports = n(9)
		}, 9: function(e, t, n){
			"use strict";

			function i(e){
				i.installed || (i.installed = !0, e.directive("router", function(e, t){
					var n = t.expression, i = void 0, o = void 0;
					"string" == typeof n && (i = e.getAttribute("style"), o = i.split(";"), o.reduce(function(e, t){
						var n = t.split("=");
						return e[n[0]] = n[1], e
					}, {}), e.dataset.set("style", o), e.style.display = "none")
				}), e.directive("href", {
					bind: function(e){
						e.tagName
					}, update: function(e){
					}
				}), e.mixin({
					data: u, methods: {}, watch: {
						path: function(e){
						}
					}
				}))
			}

			Object.defineProperty(t, "__esModule", {value: !0});
			var o = n(4), r = function(e){
					return e && e.__esModule ? e : {default: e}
				}(o), u = {path: ""}, f = new r.default.Router({mode: r.default.device.weixin ? "hash" : "history"}),
				a = r.default.url;
			f.on(function(e, t, n){
				u.path = a.parseUrl(n).path
			}), t.default = i
		}
	}, [44])
});
//# sourceMappingURL=router.js.map