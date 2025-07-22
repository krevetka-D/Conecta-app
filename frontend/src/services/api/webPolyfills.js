// frontend/src/utils/webPolyfills.js
import { Platform } from 'react-native';

// Only apply polyfills for web
if (Platform.OS === 'web') {
    // Polyfill for TextEncoder/TextDecoder if needed
    if (typeof global.TextEncoder === 'undefined') {
        const { TextEncoder, TextDecoder } = require('text-encoding');
        global.TextEncoder = TextEncoder;
        global.TextDecoder = TextDecoder;
    }

    // Polyfill for btoa/atob
    if (typeof global.btoa === 'undefined') {
        global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
        global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
    }

    // Fix for AsyncStorage on web
    if (typeof window !== 'undefined' && !window.localStorage) {
        console.warn('localStorage not available, using memory storage');
        window.localStorage = {
            _data: {},
            setItem: function(id, val) {
                this._data[id] = String(val);
            },
            getItem: function(id) {
                return this._data.hasOwnProperty(id) ? this._data[id] : null;
            },
            removeItem: function(id) {
                delete this._data[id];
            },
            clear: function() {
                this._data = {};
            }
        };
    }
}

export default {};