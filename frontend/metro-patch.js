// frontend/metro-patch.js
const fs = require('fs');
const path = require('path');

// Patch the import location
const problemFile = path.join(
    __dirname,
    'node_modules/@expo/metro-config/build/serializer/reconcileTransformSerializerPlugin.js',
);

if (fs.existsSync(problemFile)) {
    let content = fs.readFileSync(problemFile, 'utf8');

    // Replace the problematic import
    content = content.replace(
        'require(\'metro/src/ModuleGraph/worker/importLocationsPlugin\')',
        'require(\'metro/src/DeltaBundler/Serializers/helpers/importLocationsPlugin\')',
    );

    fs.writeFileSync(problemFile, content);
    console.log('✅ Metro patch applied');
}
