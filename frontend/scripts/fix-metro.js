// frontend/scripts/fix-metro.js
const fs = require('fs');
const path = require('path');

function fixMetroConfig() {
  const filesToPatch = [
    'node_modules/@expo/metro-config/build/serializer/reconcileTransformSerializerPlugin.js',
    'node_modules/expo/node_modules/@expo/metro-config/build/serializer/reconcileTransformSerializerPlugin.js'
  ];

  filesToPatch.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace the old import path with the new one
      const oldImport = "require('metro/src/ModuleGraph/worker/importLocationsPlugin')";
      const newImport = "(() => { try { return require('metro/src/ModuleGraph/worker/importLocationsPlugin'); } catch { try { return require('metro/src/DeltaBundler/Serializers/helpers/importLocationsPlugin'); } catch { return null; } } })()";
      
      if (content.includes(oldImport)) {
        content = content.replace(oldImport, newImport);
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Patched: ${filePath}`);
      }
    }
  });
}

fixMetroConfig();
console.log('✅ Metro fix applied!');