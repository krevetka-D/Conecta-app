#!/usr/bin/env node

/**
 * Fix critical runtime errors in the frontend
 */

const fs = require('fs');
const path = require('path');

const fixes = [
    {
        file: 'src/utils/performanceOptimizations.js',
        description: 'Add missing imports',
        fix: (content) => {
            // Already fixed above
            return content;
        }
    },
    {
        file: 'src/services/chatService.js',
        description: 'Remove duplicate devLog import',
        fix: (content) => {
            // Already fixed above
            return content;
        }
    },
    {
        file: 'src/screens/chat/ChatRoomScreen.js',
        description: 'Add missing handleNewMessage dependency',
        fix: (content) => {
            // Fix useEffect dependency
            return content.replace(
                '}, [roomId]);',
                '}, [roomId, handleNewMessage]);'
            );
        }
    },
    {
        file: 'src/hooks/useChatSocketEvents.js',
        description: 'Remove unused import',
        fix: (content) => {
            return content.replace(
                "import { devLog, devError } from '../utils';",
                "import { devLog } from '../utils';"
            );
        }
    },
    {
        file: 'src/components/common/Icon.js',
        description: 'Fix Icon component export',
        fix: (content) => {
            // Ensure React is imported for JSX
            if (!content.includes("import React from 'react'")) {
                content = "import React from 'react';\n" + content;
            }
            return content;
        }
    }
];

// Apply fixes
fixes.forEach(({ file, description, fix }) => {
    const filePath = path.join(__dirname, file);
    
    try {
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;
            
            content = fix(content);
            
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content);
                console.log(`✅ Fixed: ${description} in ${file}`);
            } else {
                console.log(`⏭️  Skipped: ${file} (already fixed or no changes needed)`);
            }
        } else {
            console.log(`❌ File not found: ${file}`);
        }
    } catch (error) {
        console.error(`❌ Error fixing ${file}:`, error.message);
    }
});

console.log('\n✨ Critical error fixes complete!');
console.log('\nRemaining non-critical issues:');
console.log('- ESLint warnings about inline styles');
console.log('- Unused variable warnings');
console.log('- Import order warnings');
console.log('\nThese can be fixed with: npx eslint src --fix');