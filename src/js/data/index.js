/**
 * Created by chenqifeng on 2016/4/21.
 */
var maple = require('../ns');
var cookie = require('./cookie');
var localData = require('./local');
var sessionData = require('./session');

maple.cookie = cookie;
maple.localData = localData;
maple.sessionData = sessionData;