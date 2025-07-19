// backend/scripts/security-setup.js
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Generate secure secrets
const generateSecrets = () => {
    const secrets = {
        JWT_SECRET: crypto.randomBytes(64).toString('hex'),
        JWT_REFRESH_SECRET: crypto.randomBytes(64).toString('hex'),
        SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
        ADMIN_SECRET_KEY: crypto.randomBytes(32).toString('hex'),
    };

    console.log('Generated secure secrets:');
    console.log('========================');
    Object.entries(secrets).forEach(([key, value]) => {
        console.log(`${key}=${value}`);
    });
    console.log('========================');
    console.log('⚠️  Copy these values to your .env file');
    console.log('⚠️  Never share or commit these secrets!');

    return secrets;
};

// Create .env.example file
const createEnvExample = () => {
    const envExample = `# Server Configuration
NODE_ENV=development
PORT=5001

# Database (use environment variables in production)
MONGO_URI=your_mongodb_connection_string

# Authentication (generate new secrets for production)
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=90d

# Admin Configuration
ADMIN_SECRET_KEY=your_admin_secret

# Frontend URLs for CORS
FRONTEND_URL=http://localhost:8081
DEV_IPS=192.168.1.129,10.0.2.2,localhost

# Security
BCRYPT_ROUNDS=12

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Add other configurations as needed...
`;

    fs.writeFileSync(path.join(process.cwd(), '.env.example'), envExample);
    console.log('✅ Created .env.example file');
};

// Check for security issues
const checkSecurity = () => {
    console.log('\nSecurity Check:');
    console.log('===============');
    
    // Check if .env is in .gitignore
    try {
        const gitignore = fs.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf8');
        if (!gitignore.includes('.env')) {
            console.log('❌ WARNING: .env is not in .gitignore!');
        } else {
            console.log('✅ .env is in .gitignore');
        }
    } catch (error) {
        console.log('❌ No .gitignore file found!');
    }

    // Check if .env exists and warn
    if (fs.existsSync(path.join(process.cwd(), '.env'))) {
        console.log('⚠️  .env file exists - make sure it\'s not tracked by git');
        console.log('   Run: git rm --cached .env');
    }
};

// Main execution
console.log('🔐 Security Setup Script');
console.log('=======================\n');

generateSecrets();
createEnvExample();
checkSecurity();

console.log('\n📋 Next Steps:');
console.log('1. Update your .env file with the generated secrets');
console.log('2. Change your MongoDB password immediately');
console.log('3. Run: git rm --cached .env (if .env is tracked)');
console.log('4. Add .env to .gitignore');
console.log('5. Commit .env.example instead of .env');