/**
 * Created by chenqifeng on 2016/4/21.
 */

require('./ui');
require('./util');
require('./data');

var maple = window.maple = require('./maple.ns');
var config = require('./maple.config');
maple.version = config.Version;

