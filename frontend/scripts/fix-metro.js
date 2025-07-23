// // frontend/scripts/fix-metro.js
// const fs = require('fs');
// const path = require('path');

// function fixMetroConfig() {
//   // All possible locations where the problematic import might exist
//   const filesToPatch = [
//     'node_modules/@expo/metro-config/build/serializer/reconcileTransformSerializerPlugin.js',
//     'node_modules/@expo/metro-config/build/transform-worker/metro-transform-worker.js',
//     'node_modules/expo/node_modules/@expo/metro-config/build/serializer/reconcileTransformSerializerPlugin.js',
//     'node_modules/expo/node_modules/@expo/metro-config/build/transform-worker/metro-transform-worker.js',
//     'node_modules/@expo/cli/node_modules/@expo/metro-config/build/serializer/reconcileTransformSerializerPlugin.js',
//     'node_modules/@expo/cli/node_modules/@expo/metro-config/build/transform-worker/metro-transform-worker.js'
//   ];

//   let patchedCount = 0;
//   let foundCount = 0;

//   filesToPatch.forEach(filePath => {
//     const fullPath = path.join(__dirname, '..', filePath);

//     if (fs.existsSync(fullPath)) {
//       foundCount++;
//       console.log(`\n📁 Processing: ${filePath}`);

//       let content = fs.readFileSync(fullPath, 'utf8');
//       let originalContent = content;
//       let modified = false;

//       // Check if already patched
//       if (content.includes('PATCHED - Metro compatibility fix')) {
//         console.log(`✓ Already patched`);
//         return;
//       }

//       // Pattern 1: const importLocationsPlugin_1 = require("metro/src/ModuleGraph/worker/importLocationsPlugin");
//       const requirePattern1 = /const\s+importLocationsPlugin_1\s*=\s*require\(["']metro\/src\/ModuleGraph\/worker\/importLocationsPlugin["']\);?/g;

//       // Pattern 2: import style - const { something } = require("metro/src/ModuleGraph/worker/importLocationsPlugin");
//       const requirePattern2 = /const\s*{\s*([^}]+)\s*}\s*=\s*require\(["']metro\/src\/ModuleGraph\/worker\/importLocationsPlugin["']\);?/g;

//       // Pattern 3: Direct import statement
//       const importPattern = /import\s+.*\s+from\s+["']metro\/src\/ModuleGraph\/worker\/importLocationsPlugin["'];?/g;

//       // Replace Pattern 1
//       if (requirePattern1.test(content)) {
//         content = content.replace(requirePattern1, `// PATCHED - Metro compatibility fix
// const importLocationsPlugin_1 = (() => {
//   try {
//     return require("metro/src/ModuleGraph/worker/importLocationsPlugin");
//   } catch (e) {
//     try {
//       return require("metro/src/DeltaBundler/Serializers/helpers/importLocationsPlugin");
//     } catch (e2) {
//       // Return a mock with the necessary functions
//       return {
//         locToKey: (loc) => {
//           if (!loc || typeof loc !== 'object') return '';
//           return \`\${loc.start || 0}-\${loc.end || 0}\`;
//         },
//         // Add other functions that might be needed
//         default: () => ({ visitor: {} })
//       };
//     }
//   }
// })();`);
//         modified = true;
//         console.log(`  ✓ Patched require pattern 1`);
//       }

//       // Replace Pattern 2
//       content = content.replace(requirePattern2, (match, imports) => {
//         modified = true;
//         console.log(`  ✓ Patched destructured require pattern`);
//         return `// PATCHED - Metro compatibility fix
// const { ${imports} } = (() => {
//   try {
//     return require("metro/src/ModuleGraph/worker/importLocationsPlugin");
//   } catch (e) {
//     try {
//       return require("metro/src/DeltaBundler/Serializers/helpers/importLocationsPlugin");
//     } catch (e2) {
//       // Return a mock with the necessary functions
//       return {
//         locToKey: (loc) => {
//           if (!loc || typeof loc !== 'object') return '';
//           return \`\${loc.start || 0}-\${loc.end || 0}\`;
//         },
//         default: () => ({ visitor: {} })
//       };
//     }
//   }
// })();`;
//       });

//       // Replace Pattern 3
//       content = content.replace(importPattern, (match) => {
//         modified = true;
//         console.log(`  ✓ Patched import statement`);
//         return `// PATCHED - Metro compatibility fix
// ${match.replace('metro/src/ModuleGraph/worker/importLocationsPlugin', 'metro/src/DeltaBundler/Serializers/helpers/importLocationsPlugin')}`;
//       });

//       // Also check for any other usage of the old path
//       const genericPattern = /metro\/src\/ModuleGraph\/worker\/importLocationsPlugin/g;
//       if (genericPattern.test(content)) {
//         content = content.replace(genericPattern, 'metro/src/DeltaBundler/Serializers/helpers/importLocationsPlugin');
//         modified = true;
//         console.log(`  ✓ Patched additional references`);
//       }

//       if (modified) {
//         fs.writeFileSync(fullPath, content);
//         console.log(`✅ Successfully patched!`);
//         patchedCount++;
//       } else {
//         console.log(`⚠️  No patterns found to patch`);
//       }
//     }
//   });

//   console.log(`\n📊 Summary: Found ${foundCount} files, patched ${patchedCount} files`);

//   // Also patch using find and sed for any missed files
//   console.log('\n🔍 Running additional search for any missed files...');
//   const { execSync } = require('child_process');

//   try {
//     // Find all files with the problematic import
//     const findCommand = `find node_modules -name "*.js" -type f -exec grep -l "metro/src/ModuleGraph/worker/importLocationsPlugin" {} \\; 2>/dev/null`;
//     const files = execSync(findCommand, { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);

//     console.log(`Found ${files.length} total files with the import`);

//     files.forEach(file => {
//       if (!filesToPatch.some(p => file.includes(p.replace('node_modules/', '')))) {
//         console.log(`  Additional file found: ${file}`);
//       }
//     });
//   } catch (e) {
//     // Ignore errors from find command
//   }
// }

// // Run the fix
// fixMetroConfig();

// frontend/scripts/fix-metro.js
const fs = require('fs');
const path = require('path');

// Fix the import location for Metro
const fixes = [
    {
        file: 'node_modules/@expo/metro-config/build/serializer/reconcileTransformSerializerPlugin.js',
        find: 'require(\'metro/src/ModuleGraph/worker/importLocationsPlugin\')',
        replace: 'require(\'metro/src/DeltaBundler/Serializers/helpers/importLocationsPlugin\')',
    },
];

fixes.forEach(({ file, find, replace }) => {
    const filePath = path.join(__dirname, '..', file);

    if (fs.existsSync(filePath)) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes(find)) {
                content = content.replace(find, replace);
                fs.writeFileSync(filePath, content);
                console.log(`✅ Fixed: ${file}`);
            } else {
                console.log(`⏭️  Skipped: ${file} (already fixed or pattern not found)`);
            }
        } catch (error) {
            console.error(`❌ Error fixing ${file}:`, error.message);
        }
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
});

console.log('✨ Metro fixes completed');
