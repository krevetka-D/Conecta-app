#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Backend Setup and Optimization Script');
console.log('=======================================\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from .env.example...');
    
    if (fs.existsSync(envExamplePath)) {
        let envContent = fs.readFileSync(envExamplePath, 'utf8');
        
        // Generate secure secrets
        const secrets = {
            JWT_SECRET: crypto.randomBytes(64).toString('hex'),
            JWT_REFRESH_SECRET: crypto.randomBytes(64).toString('hex'),
            SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
            ADMIN_SECRET_KEY: crypto.randomBytes(32).toString('hex'),
        };
        
        // Replace placeholders with generated secrets
        Object.entries(secrets).forEach(([key, value]) => {
            const regex = new RegExp(`${key}=.*`, 'g');
            envContent = envContent.replace(regex, `${key}=${value}`);
        });
        
        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file created with secure secrets');
        console.log('⚠️  Please update MONGO_URI with your MongoDB connection string\n');
    } else {
        console.error('❌ .env.example not found!');
        process.exit(1);
    }
} else {
    console.log('✅ .env file already exists\n');
}

// Create necessary directories
const directories = ['logs', 'uploads', 'temp'];
directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
});

// Check .gitignore
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    const requiredEntries = ['.env', 'node_modules/', 'logs/', 'uploads/', '*.log'];
    const missingEntries = requiredEntries.filter(entry => !gitignore.includes(entry));
    
    if (missingEntries.length > 0) {
        console.log('\n⚠️  Adding missing entries to .gitignore:');
        const newGitignore = gitignore + '\n# Added by setup script\n' + missingEntries.join('\n');
        fs.writeFileSync(gitignorePath, newGitignore);
        console.log('✅ Updated .gitignore');
    }
}

// Package.json scripts check
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const recommendedScripts = {
        "start": "node server.js",
        "dev": "nodemon server.js",
        "prod": "NODE_ENV=production node server.js",
        "test": "jest",
        "lint": "eslint .",
        "db:indexes": "node scripts/createIndexes.js",
        "db:optimize": "node scripts/optimizeDatabase.js",
        "setup": "node scripts/setup.js"
    };
    
    console.log('\n📦 Checking package.json scripts...');
    Object.entries(recommendedScripts).forEach(([script, command]) => {
        if (!packageJson.scripts || !packageJson.scripts[script]) {
            console.log(`  ⚠️  Missing script: npm run ${script}`);
            console.log(`     Add: "${script}": "${command}"`);
        }
    });
}

// System recommendations
console.log('\n💡 Optimization Recommendations:');
console.log('================================');
console.log('1. Database:');
console.log('   - Run: npm run db:indexes (create MongoDB indexes)');
console.log('   - Enable MongoDB Atlas Performance Advisor');
console.log('   - Use connection pooling (already configured)');
console.log('');
console.log('2. Performance:');
console.log('   - Enable PM2 for production: pm2 start ecosystem.js');
console.log('   - Use Redis for caching (optional)');
console.log('   - Enable compression (already configured)');
console.log('');
console.log('3. Security:');
console.log('   - Use HTTPS in production');
console.log('   - Set up rate limiting (already configured)');
console.log('   - Enable CORS properly (check .env)');
console.log('   - Use helmet.js for security headers');
console.log('');
console.log('4. Monitoring:');
console.log('   - Set up logging with Winston (partially configured)');
console.log('   - Use APM tools (New Relic, DataDog, etc.)');
console.log('   - Monitor error rates and response times');
console.log('');
console.log('5. Development:');
console.log('   - Use nodemon for auto-restart: npm run dev');
console.log('   - Enable MongoDB debug logs in development');
console.log('   - Use performance monitoring endpoint: /api/health');

// Environment check
console.log('\n🔍 Environment Check:');
console.log('====================');
const envVars = [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'FRONTEND_URL'
];

const envConfig = {};
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value) {
                envConfig[key.trim()] = value.trim();
            }
        }
    });
} catch (error) {
    console.error('❌ Could not read .env file');
}

envVars.forEach(varName => {
    const value = envConfig[varName];
    if (value) {
        if (varName.includes('SECRET') || varName.includes('PASSWORD')) {
            console.log(`✅ ${varName}: [REDACTED]`);
        } else if (varName === 'MONGO_URI' && value) {
            console.log(`✅ ${varName}: ${value.includes('mongodb') ? 'Configured' : '❌ Invalid'}`);
        } else {
            console.log(`✅ ${varName}: ${value}`);
        }
    } else {
        console.log(`❌ ${varName}: Not set`);
    }
});

console.log('\n✨ Setup complete! Next steps:');
console.log('1. Update .env with your MongoDB connection string');
console.log('2. Run: npm install');
console.log('3. Run: npm run db:indexes');
console.log('4. Run: npm run dev');
console.log('\nHappy coding! 🎉');