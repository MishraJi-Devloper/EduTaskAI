#!/bin/bash

# Master script for deploying EduTask AI to GitHub
# Repository: https://github.com/MishraJi-Devloper/EduTaskAI

echo "=== EduTask AI Deployment Helper ==="
echo "This script helps you deploy the project to GitHub"
echo "Repository: https://github.com/MishraJi-Devloper/EduTaskAI"
echo ""

echo "Choose an option:"
echo "1. Create a tarball for manual upload"
echo "2. Deploy directly to GitHub (requires Git)"
echo "3. Exit"

read -p "Enter your choice (1-3): " choice

case $choice in
  1)
    echo "Creating tarball file..."
    ./create-zip.sh
    ;;
  2)
    echo "Deploying to GitHub..."
    ./deploy-to-github.sh
    ;;
  3)
    echo "Exiting..."
    exit 0
    ;;
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

echo ""
echo "Next Steps:"
echo "1. Make sure to set up the OPENAI_API_KEY in your GitHub repository"
echo "   Go to Settings > Secrets and variables > Actions"
echo "   Add a new repository secret named OPENAI_API_KEY with your API key"
echo ""
echo "2. Set up GitHub Pages or another hosting service"
echo "   For GitHub Pages: Go to Settings > Pages"
echo "   Select 'GitHub Actions' as the source"
echo ""
echo "For more details, see the GITHUB_DEPLOYMENT.md file"