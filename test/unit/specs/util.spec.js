'use strict';

import util from '../../../src/util/index.js';

describe('util', ()=>{
	describe('tools', ()=>{
		it('fillZero', ()=>{
			expect( util.tools.fillZero(10, 5) ).to.equal('00010');

			expect( util.tools.fillZero(31112, 4) ).to.equal('31112');
		});
	});

	describe('dateFormat', ()=>{
		let testDate = new Date(2018, 3, 26, 17, 37, 22)
			;

		it('YYYY', ()=>{
			expect( util.dateFormat._dateStrReplace.YYYY(testDate) ).to.equal('2018');
		});
		it('YY', ()=>{
			expect( util.dateFormat._dateStrReplace.YY(testDate) ).to.equal('18');
		});
		it('MM', ()=>{
			expect( util.dateFormat._dateStrReplace.MM(testDate) ).to.equal('04');
		});
		it('DD', ()=>{
			expect( util.dateFormat._dateStrReplace.DD(testDate) ).to.equal('26');
		});
		it('hh', ()=>{
			expect( util.dateFormat._dateStrReplace.hh(testDate) ).to.equal('17');
		});
		it('mm', ()=>{
			expect( util.dateFormat._dateStrReplace.mm(testDate) ).to.equal('37');
		});
		it('ss', ()=>{
			expect( util.dateFormat._dateStrReplace.ss(testDate) ).to.equal('22');
		});
		it('www', ()=>{
			expect( util.dateFormat._dateStrReplace.www(testDate) ).to.equal('Thu');
		});
		it('week', ()=>{
			expect( util.dateFormat._dateStrReplace.week(testDate) ).to.equal('Thursday');
		});
		it('星期', ()=>{
			expect( util.dateFormat._dateStrReplace['星期'](testDate) ).to.equal('星期四');
		});
		it('周', ()=>{
			expect( util.dateFormat._dateStrReplace['周'](testDate) ).to.equal('周四');
		});

		it('formatTimeStr', ()=>{
			expect( util.dateFormat.formatTimeStr(1) ).to.equal( 24 * 60 * 60 * 1000 );
			expect( util.dateFormat.formatTimeStr(2, 's') ).to.equal( 2000 );
			expect( util.dateFormat.formatTimeStr('1000s') ).to.equal( 1000 * 1000 );
			expect( util.dateFormat.formatTimeStr(2, 'm') ).to.equal( 120 * 1000 );
			expect( util.dateFormat.formatTimeStr('3m') ).to.equal( 3 * 60 * 1000 );
			expect( util.dateFormat.formatTimeStr(4, 'h') ).to.equal( 4 * 60 * 60 * 1000 );
			expect( util.dateFormat.formatTimeStr('3h') ).to.equal( 3 * 60 * 60 * 1000 );
			expect( util.dateFormat.formatTimeStr(3, 'd') ).to.equal( 3 * 24 * 60 * 60 * 1000 );
			expect( util.dateFormat.formatTimeStr('3d') ).to.equal( 3 * 24 * 60 * 60 * 1000 );
			expect( util.dateFormat.formatTimeStr(2, 'y') ).to.equal( 2 * 365 * 24 * 60 * 60 * 1000 );
			expect( util.dateFormat.formatTimeStr('2y') ).to.equal( 2 * 365 * 24 * 60 * 60 * 1000 );
			expect( util.dateFormat.formatTimeStr('12') ).to.equal( 12 );
			expect( util.dateFormat.formatTimeStr(12, 'a') ).to.equal( 12 );
			expect( util.dateFormat.formatTimeStr({}) ).to.equal( 0 );
		});

		it('dateFormat', ()=>{
			let today = new Date()
				, m = today.getMonth() +1
				, d = today.getDate()
				;

			expect( util.dateFormat() ).to.equal(today.getFullYear() +'-'+ (m>9?m:'0'+m) +'-'+ (d>9?d:'0'+d));
			expect( util.dateFormat(testDate) ).to.equal('2018-04-26');
			expect( util.dateFormat(testDate, 'YYYY-MM-DD hh:mm:ss www week 星期 周') ).to.equal('2018-04-26 17:37:22 Thu Thursday 星期四 周四');
		});
	});

	describe('classify', ()=>{
		it('classify', ()=>{
			expect( util.classify([{
				id: 's1'
				, a: 1
			}, {
				id: 's2'
				, a: 2
			}], 'id') ).to.deep.equal({
				s1: [{
					id: 's1'
					, a: 1
				}]
				, s2: [{
					id: 's2'
					, a: 2
				}]
			});
			expect( util.classify([{
				id: 's1'
				, a: 1
			}, {
				id: 's2'
				, a: 2
			}, {
				id: 's1'
				, a: 3
			}], 'id') ).to.deep.equal({
				s1: [{
					id: 's1'
					, a: 1
				}, {
					id: 's1'
					, a: 3
				}]
				, s2: [{
					id: 's2'
					, a: 2
				}]
			});
			expect( util.classify([{
				id: 's1'
				, a: 1
			}, {
				id: 's2'
				, a: 2
			}, {
				id: 's1'
				, a: 3
			}, {
				a: 4
			}], 'id') ).to.deep.equal({
				s1: [{
					id: 's1'
					, a: 1
				}, {
					id: 's1'
					, a: 3
				}]
				, s2: [{
					id: 's2'
					, a: 2
				}]
			});
		});
	});

	describe('merge', ()=>{
		it('merge', ()=>{
			expect( util.merge({
				a: 1
				, b: 2
			}, {
				a: 2
				, c: 3
			}) ).to.deep.equal({
				a: 1
				, b: 2
				, c: 3
			});
		});
	});

	describe('lockup', ()=>{
		it('lockup', ()=>{
			let lockupTest = util.lockup(()=>{
					return 10;
				})
				;

			expect( lockupTest ).to.be.an('function');

			expect( lockupTest._enable ).to.be.true;

			expect( lockupTest() ).to.equal( 10 );

			expect( lockupTest._enable ).to.be.false;

			expect( lockupTest() ).to.be.undefined;

			lockupTest.clear();
			expect( lockupTest._enable ).to.be.true;

			expect( lockupTest() ).to.equal( 10 );
		});
	});

	describe('debounce', ()=>{
		it('debounce', (done)=>{
			let debounceTest = util.debounce(done, 100)
				;

			expect( debounceTest ).to.be.an('function');

			expect( debounceTest.cancel ).to.be.an('function');

			expect( debounceTest.immediate ).to.be.an('function');

			debounceTest();

			setTimeout(()=>{
				debounceTest();
			}, 50);
		}, 150);
		it('debounce max wait time', (done)=>{
			let debounceTest = util.debounce(done, 100, 200)
			;

			debounceTest();

			setTimeout(()=>{
				debounceTest();
			}, 50);

			setTimeout(()=>{
				debounceTest();
			}, 100);

			setTimeout(()=>{
				debounceTest();
			}, 150);
		}, 200);
		it('debounce max wait time 2', (done)=>{
			let debounceTest = util.debounce(done, 100, 200)
			;

			debounceTest();

			setTimeout(()=>{
				debounceTest();
			}, 50);
		}, 150);
		it('debounce cancel callback', (done)=>{
			let debounceTest = util.debounce(done, 100, done);

			debounceTest.cancel();

			debounceTest();

			debounceTest.cancel();

			debounceTest();

			setTimeout(()=>{
				debounceTest.cancel();
			}, 50);
		}, 50);
		it('debounce immediate', (done)=>{
			let debounceTest = util.debounce(done, 100, 200)
			;

			debounceTest();

			setTimeout(()=>{
				debounceTest.immediate();
			}, 50);
		}, 50);
	});

	describe('throttle', ()=>{
		it('throttle', (done)=>{
			let throttleTest = util.throttle(done, 100)
				;

			expect( throttleTest ).to.be.an('function');

			expect( throttleTest.cancel ).to.be.an('function');

			expect( throttleTest.immediate ).to.be.an('function');

			throttleTest();
		});
		it('throttle cancel callback', (done)=>{
			let throttleTest = util.throttle(()=>{}, 100, done)
				;

			throttleTest();

			setTimeout(()=>{
				throttleTest.cancel();
			}, 50);
		}, 50);
		it('throttle cancel callback 2', (done)=>{
			let throttleTest = util.throttle(()=>{}, 100, done)
				;

			throttleTest();

			setTimeout(()=>{
				throttleTest.cancel();
			}, 150);
		}, 150);
		it('throttle lead', (done)=>{
			let i = 0
				, throttleTest = util.throttle(()=>{
					i++;

					if( i > 1 ){
						done();
					}
				}, 100)
				;

			throttleTest();

			throttleTest();

			setTimeout(()=>{
				throttleTest();
			}, 150);
		});
		it('throttle lead 2', (done)=>{
			let i = 0
				, throttleTest = util.throttle(()=>{
					i++;

					if( i > 1 ){
						done();
					}
				}, 100, true)
				;

			throttleTest();

			throttleTest();
		}, 100);
		it('throttle immediate', (done)=>{
			let i = 0
				, throttleTest = util.throttle(()=>{
					i++;

					if( i > 1 ){
						done();
					}
				}, 100)
				;

			throttleTest();

			setTimeout(()=>{
				throttleTest.immediate();
			}, 50);
		}, 50);
	});

	describe('handlerQueue', ()=>{
		it('handlerQueue CRUD', ()=>{
			let queue = new util.HandlerQueue()

				, testExample = ()=>{}
				;

			expect( queue ).to.be.an.instanceof( util.HandlerQueue );

			expect( queue.add(testExample) ).to.equal( 1 );

			expect( queue.add([]) ).to.equal( -1 );

			expect( queue.has(testExample) ).to.be.true;

			queue.remove( testExample );

			expect( queue.has(testExample) ).to.be.false;

			let index = queue.add( testExample ) -1
				;

			queue.remove( index );

			expect( queue.has(testExample) ).to.be.false;

			expect( queue.remove([]) ).to.be.undefined;

			expect( queue.remove(()=>{}) ).to.be.undefined;

			queue.empty();

			expect( queue._queue.length ).to.be.equal( 0 );
		});

		it('handlerQueue fire fireAll', ()=>{
			let queue = new util.HandlerQueue()
				, testExample1 = (a=0)=>{
					return a +1;
				}
				, testExample2 = (a=0)=>{
					return a +2;
				}
				, testExample3 = (a=0)=>{
					return a +3;
				}
				;

			expect( queue.next() ).to.be.null;

			queue.add( testExample1 );
			queue.add( testExample2 );
			queue.add( testExample3 );

			expect( queue.next() ).to.be.equal( testExample1 );
			expect( queue._currIndex ).to.be.equal( 1 );

			expect( queue.fire() ).to.be.equal( 2 );

			queue.reset();

			expect( queue._currIndex ).to.be.equal( 0 );

			expect( queue.fire() ).to.be.equal( 1 );

			expect( queue.remain() ).to.be.true;

			queue.remove( 1 );
			expect( queue.fire() ).to.be.equal( 3 );

			expect( queue.next() ).to.be.null;

			queue.empty();
			queue.add( testExample1 );
			queue.add( testExample2 );
			queue.add( testExample3 );

			expect( queue.fireAll() ).to.deep.equal([1, 2, 3]);
			expect( queue.fireAll(2) ).to.deep.equal([3, 4, 5]);

			queue.remove( 1 );

			expect( queue.fireAll() ).to.deep.equal([1, 3]);
			expect( queue.fireAll(2) ).to.deep.equal([3, 5]);
		});

		it('handlerQueue fireLine', ()=>{
			let queue = new util.HandlerQueue()
				, testExample1 = ()=>{
					return true;
				}
				, testExample2 = ()=>{
					return false;
				}
				, testExample3 = ()=>{
					return true;
				}
				;

			queue.add( testExample1 );
			queue.add( testExample2 );
			queue.add( testExample3 );

			expect( queue.fireLine() ).to.be.false;
			expect( queue.fireLine(1) ).to.be.false;

			queue.remove( 1 );
			expect( queue.fireLine() ).to.be.true;
		});

		it('handlerQueue fireReduce', (done)=>{
			let queue = new util.HandlerQueue()
				, testExample1 = (a=0)=>{
					return a +1;
				}
				, testExample2 = (a=0)=>{
					return a +2;
				}
				, testExample3 = (a=0)=>{
					return a +3;
				}
				;

			queue.add( testExample1 );
			queue.add( testExample2 );
			queue.add( testExample3 );

			expect( queue.fireReduce() ).to.be.an('promise');
			queue.fireReduce().then((rs)=>{
				expect( rs ).to.be.equal( 6 );
				done();
			});
		});
		it('handlerQueue fireReduce 2', (done)=>{
			let queue = new util.HandlerQueue()
				, testExample1 = (a=0)=>{
					return a +1;
				}
				, testExample2 = (a=0)=>{
					return a +2;
				}
				, testExample3 = (a=0)=>{
					return a +3;
				}
				;

			queue.add( testExample1 );
			queue.add( testExample2 );
			queue.add( testExample3 );

			queue.fireReduce( 5 ).then((rs)=>{
				expect( rs ).to.be.equal( 11 );
				done();
			});
		});
		it('handlerQueue fireReduce 3', (done)=>{
			let queue = new util.HandlerQueue()
				, testExample1 = (a=0)=>{
					return a +1;
				}
				, testExample2 = (a=0)=>{
					return a +2;
				}
				, testExample3 = (a=0)=>{
					return a +3;
				}
				;

			queue.add( testExample1 );
			queue.add( testExample2 );
			queue.add( testExample3 );

			queue.remove( 1 );
			queue.fireReduce().then((rs)=>{
				expect( rs ).to.be.equal( 4 );
				done();
			});
		});

		it('handlerQueue fireWith fireAllWith', ()=>{
			let queue = new util.HandlerQueue()
				, testExample1 = function(a=0){
					return this.a + a + 1;
				}
				, testExample2 = function(a=0){
					return this.a + a + 2;
				}
				, testExample3 = function(a=0){
					return this.a + a + 3;
				}
				, testTarget = {
					a: 3
				}
				;

			queue.add( testExample1 );
			queue.add( testExample2 );
			queue.add( testExample3 );

			expect( queue.fireWith(testTarget) ).to.be.equal( 4 );
			expect( queue.fireWith(testTarget, 1) ).to.be.equal( 6 );
			expect( queue.fireWith(testTarget, [1]) ).to.be.equal( 7 );

			queue.reset();

			expect( queue.fireAllWith(testTarget, 4) ).to.deep.equal([8, 9, 10]);
			expect( queue.fireAllWith(testTarget, [4]) ).to.deep.equal([8, 9, 10]);

			queue.remove( 1 );
			expect( queue.fireAllWith(testTarget, 4) ).to.deep.equal([8, 10]);
		});

		it('handlerQueue fireLineWith', ()=>{
			let queue = new util.HandlerQueue()
				, testExample1 = function(a=0){
					return !!((this.a + a + 1) % 2);
				}
				, testExample2 = function(a=0){
					return !!((this.a + a + 2) % 2);
				}
				, testExample3 = function(a=0){
					return !!((this.a + a + 3) % 2);
				}
				, testTarget = {
					a: 4
				}
				;

			queue.add( testExample1 );
			queue.add( testExample2 );
			queue.add( testExample3 );

			expect( queue.fireLineWith(testTarget) ).to.be.false;
			expect( queue.fireLineWith(testTarget, 1) ).to.be.false;

			queue.remove( 1 );
			expect( queue.fireLineWith(testTarget) ).to.be.true;
		});

		it('handlerQueue fireReduceWith', (done)=>{
			let queue = new util.HandlerQueue()
				, testExample1 = function(a=0){
					return this.a + a + 1;
				}
				, testExample2 = function(a=0){
					return this.a + a + 2;
				}
				, testExample3 = function(a=0){
					return this.a + a + 3;
				}
				, testTarget = {
					a: 3
				}
				;

			queue.add( testExample1 );
			queue.add( testExample2 );
			queue.add( testExample3 );

			expect( queue.fireReduceWith(testTarget) ).to.be.an('promise');
			queue.fireReduceWith(testTarget).then((rs)=>{
				expect( rs ).to.be.equal( 15 );
				done();
			});
		});
		it('handlerQueue fireReduceWith 2', (done)=>{
			let queue = new util.HandlerQueue()
				, testExample1 = function(a=0){
					return this.a + a + 1;
				}
				, testExample2 = function(a=0){
					return this.a + a + 2;
				}
				, testExample3 = function(a=0){
					return this.a + a + 3;
				}
				, testTarget = {
					a: 3
				}
				;

			queue.add( testExample1 );
			queue.add( testExample2 );
			queue.add( testExample3 );

			queue.fireReduceWith(testTarget, 5).then((rs)=>{
				expect( rs ).to.be.equal( 20 );
				done();
			});
		});
		it('handlerQueue fireReduceWith 3', (done)=>{
			let queue = new util.HandlerQueue()
				, testExample1 = function(a=0){
					return this.a + a + 1;
				}
				, testExample2 = function(a=0){
					return this.a + a + 2;
				}
				, testExample3 = function(a=0){
					return this.a + a + 3;
				}
				, testTarget = {
					a: 3
				}
				;

			queue.add( testExample1 );
			queue.add( testExample2 );
			queue.add( testExample3 );

			queue.remove( 1 );
			queue.fireReduceWith(testTarget).then((rs)=>{
				expect( rs ).to.be.equal( 10 );
				done();
			});
		});
	});
});