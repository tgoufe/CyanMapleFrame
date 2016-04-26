/**
 * Created by chenqifeng on 2016/4/21.
 */
function Class(){}
Class.extend = function(proto) {
    var base = function() {},
        member,
        that = this,
        subclass = proto && proto.init ? proto.init : function () {
            that.apply(this, arguments);
        },
        fn;
    base.prototype = that.prototype;
    fn = subclass.fn = subclass.prototype = new base();
    for (member in proto) {
        if(proto.hasOwnProperty(member)){
            if (typeof proto[member] === 'object' && !(proto[member] instanceof Array) && proto[member] !== null) {
                // Merge object members
                fn[member] = $.extend(true, {}, base.prototype[member], proto[member]);
            } else {
                fn[member] = proto[member];
            }
        }
    }
    fn.constructor = subclass;
    subclass.extend = that.extend;
    return subclass;
};

module.exports = Class;
