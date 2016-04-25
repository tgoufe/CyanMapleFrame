/**
 * Created by chenqifeng on 2016/4/22.
 */

var util = require('../util/maple.util'),
    support = require('../util/maple.support'),
    config = require('../maple.config'),
    sessionKey = config.sessionStorageNameSpace,
    cache = support.sessionStorage ? sessionStorage : false,
    data = support.sessionStorage ?　JSON.parse((cache.getItem(sessionKey) || JSON.stringify({}))) : {},
    sessionData = function(){
            var length = arguments.length;
            if(!length){
                return data;
            }else if(length === 1){
                if(util.isObject(arguments[0])){
                    data = $.extend({},data,arguments[0]);
                    cache && cache.setItem(sessionKey,JSON.stringify(data));
                }else{
                    return data[arguments[0]]
                }
            }else if(length === 2){
                data[arguments[0]] = arguments[1];
                cache && cache.setItem(sessionKey,JSON.stringify(data));
            }
        };
sessionData.remove = function(key){
    var i = 0,
        length = arguments.length;
    if(!length){
        this.removeAll();
    }else{
        for(; i < length; i++){
            data[arguments[i]] = undefined;
            delete data[arguments[i]];
        }
        cache && cache.setItem(sessionKey,JSON.stringify(data));
    }
};
sessionData.removeAll = function(){
    data = {};
    cache && cache.setItem(sessionKey,JSON.stringify(data));
}


module.exports = sessionData;