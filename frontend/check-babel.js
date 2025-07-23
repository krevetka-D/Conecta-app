// check-babel.js
console.log('Checking babel configuration...\n');

// Create a more complete mock Babel API
const api = {
    cache: (fn) => (fn === true ? null : fn()),
    caller: (fn) => fn({ name: 'babel-check', supportsStaticESM: true }),
    env: () => 'development',
    version: '7.20.0',
    assertVersion: () => true,
};

// Check babel-preset-expo
try {
    const presetExpo = require('babel-preset-expo');
    console.log('babel-preset-expo loaded successfully');
    console.log('Type:', typeof presetExpo);

    const presetConfig = presetExpo(api, {});
    console.log('\nPreset returns:', typeof presetConfig);

    if (presetConfig && presetConfig.plugins) {
        console.log(`\nPreset has ${presetConfig.plugins.length} plugins`);
        presetConfig.plugins.forEach((plugin, index) => {
            const pluginType = typeof plugin;
            const pluginInfo = Array.isArray(plugin)
                ? `Array[${plugin.length}]: ${typeof plugin[0]} ${plugin[0]?.name || plugin[0]}`
                : `${pluginType}: ${plugin?.name || plugin}`;
            console.log(`  Plugin[${index}]: ${pluginInfo}`);

            // Check if this is the problematic plugin
            if (
                index === 1 &&
                pluginType !== 'string' &&
                pluginType !== 'object' &&
                pluginType !== 'function'
            ) {
                console.log(`  ⚠️  PROBLEM: Plugin at index 1 is ${pluginType}`);
            }
        });
    }
} catch (e) {
    console.error('Error with babel-preset-expo:', e.message);
    console.error(e.stack);
}
