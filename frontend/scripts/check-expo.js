const { execSync } = require('child_process');

console.log('Checking Expo configuration...\n');

try {
    // Check if Expo CLI is installed
    execSync('expo --version', { stdio: 'inherit' });

    // Run expo doctor
    console.log('\nRunning Expo Doctor...\n');
    execSync('expo doctor', { stdio: 'inherit' });

    // Check network configuration
    console.log('\n✅ Expo configuration looks good!');
    console.log('\nTo start the app:');
    console.log('1. Make sure your device is on the same network as your computer');
    console.log('2. Run: npm start');
    console.log('3. Scan the QR code with Expo Go app\n');
} catch (error) {
    console.error('❌ Expo configuration check failed!');
    console.error('Please install Expo CLI: npm install -g expo-cli');
}
