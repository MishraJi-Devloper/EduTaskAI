// Create a script that generates a tar file of the project
// for easy download and deployment to GitHub

import fs from 'fs';
import path from 'path';
import * as tar from 'tar';
import { execSync } from 'child_process';

// Files and directories to include
const filesToInclude = [
  'client',
  'server',
  'shared',
  '.github',
  'components.json',
  'drizzle.config.ts',
  'package.json',
  'postcss.config.js',
  'tailwind.config.ts',
  'tsconfig.json',
  'vite.config.ts',
  'LICENSE',
  'README.md',
  '.env.example',
  '.gitignore',
  'vercel.json',
  'netlify.toml',
  'GITHUB_DEPLOYMENT.md'
];

// Create the tar file
console.log('Creating archive of the project...');

try {
  // Create a temporary directory for the files
  if (!fs.existsSync('tmp')) {
    fs.mkdirSync('tmp');
  }

  // Copy files to the temporary directory
  filesToInclude.forEach(file => {
    if (fs.existsSync(file)) {
      const destPath = path.join('tmp', file);
      const command = `cp -r "${file}" "${destPath}"`;
      execSync(command);
    }
  });

  // Create the tar file
  tar.c(
    {
      gzip: true,
      file: 'edutask-ai-export.tar.gz',
      cwd: 'tmp'
    },
    fs.readdirSync('tmp')
  ).then(() => {
    console.log('Archive created: edutask-ai-export.tar.gz');
    
    // Clean up
    execSync('rm -rf tmp');
    
    console.log('\nYou can now download this file and upload it to your GitHub repository:');
    console.log('https://github.com/MishraJi-Devloper/EduTaskAI');
  });
} catch (error) {
  console.error('Error creating archive:', error);
}