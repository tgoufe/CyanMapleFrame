'use strict';

console._log = console.log;

let logArea = document.createElement('div')
	;

logArea.style.cssText = `
position: fixed;
top: 0;
left: 0;
right: 0;
z-index: 10;
height: 40px;
`;

document.body.appendChild( logArea );

let log = function(){
	let log = document.createElement('p')
		;

	log.innerHTML = Array.from( arguments ).join(' ');

	logArea.appendChild( log );

	console._log.apply(console, arguments);
};

console.log = log;

export default log;