'use strict';

import maple    from 'maple';
import log      from '../log.js';

let h = new maple.util.HandlerQueue()
	;

h.add((a)=>{
	log( 1 );
	return a +1;
});
h.add((a)=>{
	log( 2 );
	return a +2;
});
h.add((a)=>{
	log( 3 );
	return a +3;
});
h.add((a)=>{
	log( 4 );
	return a +4;
});
h.add((a)=>{
	log( 5 );
	return a +5;
});

log('all: ', h.all(1));
log('pipe: ', h.pipe(1));
log('compose: ', h.compose(1));
log('line: ', h.line(1));

h.clear();

let exe = (last)=>{
	return new Promise((resolve)=>{
		setTimeout(()=>{
			let t = Date.now()
				;

			last && log( last );
			log( t );

			resolve( t );
		}, 1000);
	});
};

h.add( exe );
h.add( exe );
h.add( exe );
h.add( exe );
h.add( exe );

let promiseH = h.promise
	;

log('promise');
promiseH.all().then((rs)=>{
	log('all: ', rs);
});
promiseH.pipe().then((rs)=>{
	log('pipe: ', rs);
});
promiseH.compose().then((rs)=>{
	log('compose: ', rs);
});
promiseH.line().then((rs)=>{
	log('line: ', rs);
});

h.clear();

h.add(function(a){
	log( this.a );
	return this.a + a +1;
});
h.add(function(b){
	log( this.b );
	return this.b + b +1;
});
h.add(function(c){
	log( this.c );
	return this.c + c +1;
});
h.add(function(d){
	log( this.d );
	return this.d + d +1;
});
h.add(function(e){
	log( this.e );
	return this.e + e +1;
});

let withH = h.with({a: 1, b: 2, c: 3, d: 4, e: 5})
	;

log('with({a: 1, b: 2, c: 3, d: 4, e: 5})');
log('all: ', withH.all(1));
log('pipe: ', withH.pipe(1));
log('compose: ', withH.compose(1));
log('line: ', withH.line(1));

h.clear();

let promiseWithH = withH.promise
	;

let exePromise = function(last){
		return new Promise((resolve)=>{
			setTimeout(()=>{
				let t = Date.now()
					;

				last && log( last );
				log(t, this.a);

				resolve( t );
			}, 1000);
		});
	}
	;

h.add( exePromise );
h.add( exePromise );
h.add( exePromise );
h.add( exePromise );
h.add( exePromise );

log('with({a: 1, b: 2, c: 3, d: 4, e: 5}).promise');
promiseWithH.all().then((rs)=>{
	log('all: ', rs);
});
promiseWithH.pipe().then((rs)=>{
	log('pipe: ', rs);
});
promiseWithH.compose().then((rs)=>{
	log('compose: ', rs);
});
promiseWithH.line().then((rs)=>{
	log('line: ', rs);
});
