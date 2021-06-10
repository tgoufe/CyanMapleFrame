'use strict';

import maple from 'maple';

let logArea = document.createElement('div')
	;

logArea.style.cssText = `
position: fixed;
top: 50px;
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

		maple.log( ...arguments );
	}
	;

export default log;