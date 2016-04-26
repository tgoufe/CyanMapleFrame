/**
 * Created by chenqifeng on 2016/4/22.
 */
var util = require('../util/util'),
    support = require('../util/support'),
    config = require('../config'),
    sessionKey = config.localStorageNameSpace,
    cache = support.localStorage ? localStorage : false,
    data = support.localStorage ?　JSON.parse((cache.getItem(sessionKey) || JSON.stringify({}))) : {},
    formatData = function(){
        var d = {},
            i,
            t = new Date().getTime();
        for(i in data){
            if(t - data[i].t < data[i].time || !data[i].time){
                d[i] = data[i].value;
            }
        }
        return d;
    },
    localData = function (){
            var length = arguments.length,d = {}, i,t = new Date().getTime();
            if(!length){
                return formatData();
            }else if(length === 1){
                if(util.isObject(arguments[0])){
                    for( i in arguments[0]){
                        d[i] = {value:arguments[0][i],time:0,t:t};
                    }
                    data = $.extend({},data,d);
                    cache && cache.setItem(sessionKey,JSON.stringify(data));
                }else{
                    return formatData()[arguments[0]]
                }
            }else if(length === 2){
                if(util.isObject(arguments[0]) && util.isTimeStr(arguments[1])){
                    for( i in arguments[0]){
                        d[i] = {value:arguments[0][i],time:util.formatTimeStr(arguments[1]),t:t};
                    }
                    data = $.extend({},data,d);
                }else{
                    data[arguments[0]] = {value:arguments[1],time:0,t:t}
                }
                cache && cache.setItem(sessionKey,JSON.stringify(data));
            }else if(length === 3){
                d[arguments[0]] = {value:arguments[1],time:util.formatTimeStr(arguments[2]),t:t};
                data = $.extend({},data,d);
                cache && cache.setItem(sessionKey,JSON.stringify(data));
            }
        }
localData.remove = function(key){
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
localData.removeAll = function(){
    data = {};
    cache && cache.setItem(sessionKey,JSON.stringify(data));
};


module.exports = localData;