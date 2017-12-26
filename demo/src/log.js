'use strict';

console._log = console.log;

let log = function(){
	let log = document.createElement('p')
		;

	log.innerHTML = Array.from( arguments ).join(' ');

	document.body.appendChild( log );

	console._log.apply(console, arguments);
};

console.log = log;

export default log;