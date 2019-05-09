'use strict';

class Aspect extends Function{
	constructor(original){
		super(`
arguments.callee.beforeRun(this, arguments);
let rs = arguments.callee.original.apply(this, arguments);
arguments.callee.afterRun(this, arguments);
return rs;
`);
		this.beforeQueue = [];
		this.afterQueue = [];

		this.original = original;
	}
	before(...args){
		this.beforeQueue.push.apply(this.beforeQueue, args);

		return this;
	}
	beforeRun(that, args){
		this.beforeQueue.forEach( executor=>executor.apply(that, args) );
	}
	after(...args){
		this.afterQueue.push.apply(this.afterQueue, args);

		return this;
	}
	afterRun(that, args){
		this.afterQueue.forEach( executor=>executor.apply(that, args) );
	}
	around(before, after){
		this.beforeQueue.push( before );
		this.afterQueue.push( after || before );
		
		return this;
	}
}

let aspect = function(original){
		return new Aspect( original );
	}
	;

// let aspect = function(original){
// 		let rs = new Function(`
// arguments.callee.beforeRun(this, arguments);
// let rs = arguments.callee.original.apply(this, arguments);
// arguments.callee.afterRun(this, arguments);
// return rs;`)
// 			;
//
// 		rs.beforeQueue = [];
// 		rs.afterQueue = [];
// 		rs.original = original;
// 		rs.before = function(...args){
// 			rs.beforeQueue.push.apply(rs.beforeQueue, args);
//
// 			return rs;
// 		};
// 		rs.beforeRun = function(that, args){
// 			rs.beforeQueue.forEach( executor=>executor.apply(that, args) );
// 		};
// 		rs.after = function(...args){
// 			rs.afterQueue.push.apply(rs.afterQueue, args);
//
// 			return rs;
// 		};
// 		rs.afterRun = function(that, args){
// 			this.afterQueue.forEach(executor=>executor.apply(that, args) );
// 		};
//
// 		return rs;
// 	}
// 	;

export default aspect;

export {
	Aspect
};