/**
 * Created by chenqifeng on 2016/4/21.
 */
var maple = require('../maple.ns');
var cookie = require('./maple.cookie');
var localData = require('./maple.local');
var sessionData = require('./maple.session');

maple.cookie = cookie;
maple.localData = localData;
maple.sessionData = sessionData;