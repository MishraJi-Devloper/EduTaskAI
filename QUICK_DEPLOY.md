# Quick Deployment Guide for EduTask AI

Follow these simple steps to deploy EduTask AI to your GitHub repository:

## Step 1: Download the Package

1. Download the `EduTaskAI.tar.gz` file by running:
   ```
   ./create-zip.sh
   ```
   
2. Click on the file in the Replit file explorer and select "Download" to save it to your computer

## Step 2: Upload to GitHub

1. Go to your GitHub repository: [https://github.com/MishraJi-Devloper/EduTaskAI](https://github.com/MishraJi-Devloper/EduTaskAI)

2. If the repository is empty:
   - Click the "Add file" button at the top right
   - Select "Upload files"
   - Drag and drop the extracted files from the tarball
   - Click "Commit changes"

3. If the repository already has files:
   - Extract the tarball on your computer: `tar -xzf EduTaskAI.tar.gz`
   - Click the "Add file" button at the top right
   - Select "Upload files"
   - Drag and drop the extracted files
   - Add a commit message: "Upload EduTask AI files"
   - Click "Commit changes"

## Step 3: Set Up OpenAI API Key

1. In your GitHub repository, go to:
   - Settings → Secrets and variables → Actions

2. Click "New repository secret"
   - Name: `OPENAI_API_KEY`
   - Value: [Your OpenAI API Key]
   - Click "Add secret"

## Step 4: Enable GitHub Pages

1. In your GitHub repository, go to:
   - Settings → Pages

2. Under "Build and deployment":
   - Source: Select "GitHub Actions"
   - The workflow will automatically deploy your site

## Step 5: View Your Deployed Site

After the GitHub Actions workflow completes, your site will be available at:
`https://mishraji-devloper.github.io/EduTaskAI/`

## Need More Help?

For more detailed instructions, see:
- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- `GITHUB_DEPLOYMENT.md` - GitHub-specific instructions

Or run the interactive helper script:
```
./deploy-help.sh
```