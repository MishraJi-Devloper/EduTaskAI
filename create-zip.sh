#!/bin/bash

# Script to create a tarball of the EduTask AI project
# for easy upload to GitHub

# Create a temporary directory for the contents
mkdir -p tmp_for_tar

# Copy all files except node_modules and tmp directories
echo "Copying project files..."
cp -r client shared server components.json drizzle.config.ts package.json postcss.config.js tailwind.config.ts tsconfig.json vite.config.ts LICENSE README.md .env.example .gitignore vercel.json netlify.toml GITHUB_DEPLOYMENT.md .github deploy-help.sh DEPLOYMENT_GUIDE.md QUICK_DEPLOY.md tmp_for_tar/

# Create the tar file
echo "Creating tar file..."
tar -czf EduTaskAI.tar.gz -C tmp_for_tar .

# Clean up
rm -rf tmp_for_tar

echo "Done! The project has been packaged as EduTaskAI.tar.gz"
echo "You can now download and extract this file, then upload to your GitHub repository:"
echo "https://github.com/MishraJi-Devloper/EduTaskAI"