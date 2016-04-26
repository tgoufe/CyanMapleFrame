var support = {};
support.sessionStorage = window.sessionStorage && window.sessionStorage.setItem && typeof window.sessionStorage.setItem === 'function';
support.localStorage = window.localStorage && window.localStorage.setItem && typeof window.localStorage.setItem === 'function';
support.replaceState = typeof history.replaceState === 'function';
support.pushState = typeof history.pushState === 'function';

module.exports = support;