// fix-icon-imports.js
const fs = require('fs');
const path = require('path');

const files = [
    './src/components/common/EmptyState.js',
    './src/components/common/ErrorBoundary.js',
    './src/components/ui/Header.js',
    './src/components/ui/Modal.js',
    './src/components/ui/TabBar.js',
    './src/navigation/MainNavigator.js',
    './src/screens/auth/RegisterScreen.js',
    './src/screens/budget/BudgetScreen.js',
    './src/screens/checklist/ChecklistScreen.js',
    './src/screens/content/GuideDetailScreen.js',
    './src/screens/content/ResourcesScreen.js',
    './src/screens/events/CreateEventScreen.js',
    './src/screens/events/EventDetailScreen.js',
    './src/screens/events/EventsScreen.js',
    './src/screens/forums/ForumDetailScreen.js',
    './src/screens/forums/ForumScreen.js',
    './src/screens/main/DashboardScreen.js',
    './src/screens/main/ProfileScreen.js',
    './src/screens/onboarding/PathSelectionScreen.js',
];

files.forEach(file => {
    const filePath = path.join(__dirname, file);

    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace the import statement
        content = content.replace(
            /import Icon from ['"]react-native-vector-icons\/MaterialCommunityIcons['"];?/g,
            'import { MaterialCommunityIcons as Icon } from \'@expo/vector-icons\';'
        );

        // Write the file back
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${file}`);
    } catch (error) {
        console.error(`❌ Error updating ${file}:`, error.message);
    }
});

console.log('\n✨ Icon import updates complete!');
console.log('Now run: npx expo start --clear');