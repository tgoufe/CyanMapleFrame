var aspects = {
    /**
     * 前置增强
     */
    before:function(target,method,advice){
        var original = target[method],obj;
        advice = typeof advice === 'function' ? advice : function(){};
        target[method] = function(){
            (advice)();
            obj = original.apply(target,arguments);
            return obj;
        };
        return target;
    },
    /**
     * 后置增强
     */
    after:function(target,method,advice){
        var original = target[method],obj;
        advice = typeof advice === 'function' ? advice : function(){};
        target[method] = function(){
            obj = original.apply(target,arguments);
            (advice)();
            return obj;
        };
        return target;
    },
    /**
     * �环绕增强
     */
    around:function(target,method,advice){
        var original = target[method],obj;
        advice = typeof advice === 'function' ? advice : function(){};
        target[method] = function(){
            (advice)();
            obj = original.apply(target,arguments);
            (advice)();
            return obj;
        };
        return target;
    },
    /**
     * �异常处理
     */
    catchError:function(target,method){
        var original = target[method],obj;
        target[method] = function(){
            try{
                obj = original.apply(target,arguments);
            }catch(e){
                console.error('方法：' + method + '   msg: '+ e.message);
                console.error(e);
            }
            return obj;
        };
        return original;
    }
}

module.exports = aspects;