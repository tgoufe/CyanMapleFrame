/**
 * Created by chenqifeng on 2016/4/21.
 */

require('./ui');
require('./util');
require('./data');

var maple = window.maple = require('./ns');
var config = require('./config');
maple.version = config.Version;

