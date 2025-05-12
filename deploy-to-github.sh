#!/bin/bash

# Script to deploy EduTask AI to GitHub
# Repository: https://github.com/MishraJi-Devloper/EduTaskAI

GITHUB_USERNAME="MishraJi-Devloper"
REPO_NAME="EduTaskAI"

echo "Setting up repository for GitHub deployment..."

# Initialize git if not already initialized
if [ ! -d .git ]; then
    git init
    echo "Git repository initialized."
fi

# Add all files
git add .

# Commit changes
git commit -m "Initial commit of EduTask AI"

# Add GitHub remote
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

echo ""
echo "Now push to GitHub with:"
echo "git push -u origin main"
echo ""
echo "After pushing, go to your GitHub repository settings and enable GitHub Pages"
echo "1. Go to Settings > Pages"
echo "2. Select 'GitHub Actions' as the source"
echo ""
echo "Remember to add your OPENAI_API_KEY as a secret in your GitHub repository:"
echo "1. Go to Settings > Secrets and variables > Actions"
echo "2. Click 'New repository secret'"
echo "3. Name: OPENAI_API_KEY"
echo "4. Value: your_openai_api_key"

echo ""
echo "For other hosting options:"
echo "1. Netlify: Connect this repository to Netlify and it will automatically use netlify.toml"
echo "2. Vercel: Connect this repository to Vercel and it will automatically use vercel.json"

chmod +x deploy-to-github.sh