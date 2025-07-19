// frontend/src/utils/polyfills.js
import { Platform } from 'react-native';

// Polyfill for TextEncoder/TextDecoder
if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = require('text-encoding').TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = require('text-encoding').TextDecoder;
}

// Polyfill for atob/btoa
if (typeof global.atob === 'undefined') {
    global.atob = (str) => {
        return Buffer.from(str, 'base64').toString('binary');
    };
}

if (typeof global.btoa === 'undefined') {
    global.btoa = (str) => {
        return Buffer.from(str, 'binary').toString('base64');
    };
}

// Ensure global is defined
if (typeof global === 'undefined') {
    window.global = window;
}

// Fix for Hermes engine
if (typeof HermesInternal !== 'undefined') {
    // Ensure Promise is available
    if (typeof Promise === 'undefined') {
        global.Promise = require('promise/setimmediate/es6-extensions');
    }
}