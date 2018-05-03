'use strict';

const testsContext = require.context('./specs', true)
	;

testsContext.keys().forEach( testsContext );