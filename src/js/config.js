/**
 * Created by chenqifeng on 2016/4/21.
 */
//var packageJson = require('json!../../../package.json');

module.exports = {
    //版本
    Version:'1.0.0',

    //当前页面样式
    activePageClass : "ui-page-active",

    //页面切换默认动画
    defaultPageTransition : "fade",

    //dialog 弹出默认动画
    defaultDialogTransition : "pop",

    //页面加载异常提示信息
    pageLoadErrorMessage : "网络异常,请稍后重试",

    //sessionStorage命名空间
    sessionStorageNameSpace : 'maple_session',

    //sessionStorage默认缓存时间 （默认5分钟）
    sessionDefaultExpireTimeSpan : 5*60*1000,

    //localStorage命名空间
    localStorageNameSpace : 'maple_local',

    //localStorage默认缓存时间（单位分钟）（默认1天）
    localDefaultExpireTimeSpan : 24*60,

    //清缓存的延迟等待时间
    cleanCacheDelayTime : 1500,
};