!function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n=t();for(var r in n)("object"==typeof exports?exports:e)[r]=n[r]}}("undefined"!=typeof self?self:this,function(){return webpackJsonp([2],{51:function(e,t,n){e.exports=n(52)},52:function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(4),o=function(e){return e&&e.__esModule?e:{default:e}}(r),u=new o.default.Router({mode:o.default.device.weixin?"hash":"history"}),i={install:function(e){i.installed||(i.installed=!0,e.directive("router",function(e,t){var n=t.value,r=void 0;r="function"==typeof n?n():n,e.style.display=r?"":"none"}),e.directive("href",function(e,t){var n=t.value;"A"===e.tagName?e.dataset.on||(e.addEventListener("click",function(){u.go(n)||url.changePage(n)}),e.dataset.on=!0):e.href=n}),e.mixin({data:function(){return{currentRouter:""}},methods:{router:function(e){return!!this.currentRouter&&-1!==Array.from(arguments).indexOf(this.currentRouter)}}}))},installed:!1,router:u,init:function(e){u.init(),u.on(function(){e.currentRouter=this.currentPath}),e.currentRouter=u.currentPath,o.default.url.popState.add(function(){e.currentRouter=u.currentPath})}};t.default=i}},[51])});
//# sourceMappingURL=router.js.map