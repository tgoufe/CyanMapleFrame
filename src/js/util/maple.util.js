/**
 * Created by chenqifeng on 2016/4/21.
 */


var r_trim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
    r_boolean = /^(true|false)$/,
    r_number = /^\d+$/,
    util;

util = {
    getUid:function(){
        var id = "", i, random;
        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;

            if (i == 8 || i == 12 || i == 16 || i == 20) {
                id += "-";
            }
            id += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
        }

        return id;
    },
    stringToStrongType:function(variate){
        if(typeof variate !== 'string'){
            return variate;
        }
        variate = this.trim(variate);
        if(r_boolean.test(variate)){
            return Boolean(variate);
        }else if(r_number.test(variate)){
            return Number(variate);
        }else if(variate === 'undefined'){
            return undefined;
        }else if(variate === 'null'){
            return null;
        }else{
            return variate;
        }
    },
    trim:function(str){
        str = str || '';
        return str.replace(r_trim,'')
    },
    formatDate:function(date, format){
        if (arguments.length < 2 && !date.getTime) {
            format = date;
            date = new Date();
        }
        typeof format != 'string' && (format = 'YYYY年MM月DD日 hh时mm分ss秒');
        var week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', '日', '一', '二', '三', '四', '五', '六'];
        return format.replace(/YYYY|YY|MM|DD|hh|mm|ss|星期|周|www|week/g, function(a) {
            switch (a) {
                case "YYYY": return date.getFullYear();
                case "YY": return (date.getFullYear()+"").slice(2);
                case "MM": return (date.getMonth() + 1 < 10) ? "0"+ (date.getMonth() + 1) : date.getMonth() + 1;
                case "DD": return (date.getDate() < 10) ? "0"+ date.getDate() : date.getDate();
                case "hh": return (date.getHours() < 10) ? "0"+ date.getHours() : date.getHours();
                case "mm": return (date.getMinutes() < 10) ? "0"+ date.getMinutes() : date.getMinutes();
                case "ss": return (date.getSeconds() < 10) ? "0"+ date.getSeconds() : date.getSeconds();
                case "星期": return "星期" + week[date.getDay() + 7];
                case "周": return "周" +  week[date.getDay() + 7];
                case "week": return week[date.getDay()];
                case "www": return week[date.getDay()].slice(0,3);
            }
        });
    },
    isArray:function(array){
        return Object.prototype.toString.call(array) === "[object Array]";
    },
    isObject:function(object){
        return Object.prototype.toString.call(object) === "[object Object]";
    },
    isFunction:function(fn){
        return typeof fn === 'function'
    },
    extend:function(a,b,c){
        a = a || {};
        b = b || {};
        c = c || {};
    },
    reject:function(){

    },
    find:function(){

    },
    where:function(){

    },
    isTimeStr:function(str){
        str = str || '';
        return /^\d+(s|m|h|d)?$/.test(str);
    },
    formatTimeStr:function(str){
        if(!this.isTimeStr(str)){
            return 0;
        }
        str = str || '';
        var num = Number(str.match(/\d+/)[0]);
        if(/s$/.test(str)){
            return num * 1000;
        }else if(/m$/.test(str)){
            return num * 60 * 1000;
        }else if(/h$/.test(str)){
            return num * 60 * 60 * 1000;
        }else if(/d$/.test(str)){
            return num * 24 * 60 * 60 * 1000;
        }else{
            return num;
        }
    }
};

module.exports = util;