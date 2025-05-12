# EduTask AI Deployment Guide

This guide provides detailed instructions for deploying the EduTask AI application to your GitHub repository at [https://github.com/MishraJi-Devloper/EduTaskAI](https://github.com/MishraJi-Devloper/EduTaskAI).

## Preparation

The following files have been created to help with deployment:

1. **deploy-help.sh** - A master script that offers multiple deployment options
2. **create-zip.sh** - Creates a zip file for manual upload to GitHub
3. **export-project.js** - Creates a tar.gz archive for download and upload
4. **deploy-to-github.sh** - Direct deployment to GitHub (requires Git CLI)
5. **.github/workflows/deploy.yml** - GitHub Actions workflow for automatic deployment

## Deployment Options

### Option 1: Using the Deployment Helper

The easiest way to deploy is using the deployment helper script:

```bash
./deploy-help.sh
```

This interactive script will present you with the following options:

1. Create a zip file for manual upload
2. Export project as tar.gz file 
3. Deploy directly to GitHub (requires Git)
4. Exit

### Option 2: Manual Deployment to GitHub

1. Go to your GitHub repository: [https://github.com/MishraJi-Devloper/EduTaskAI](https://github.com/MishraJi-Devloper/EduTaskAI)
2. Click "Add file" → "Upload files"
3. Drag and drop the files from this project (or upload the zip/tar.gz file created by the helper scripts)
4. Commit the changes

### Option 3: Command Line Deployment with Git

If you're comfortable with Git and have it installed:

```bash
git init
git add .
git commit -m "Initial commit of EduTask AI"
git remote add origin https://github.com/MishraJi-Devloper/EduTaskAI.git
git push -u origin main
```

## Post-Deployment Setup

After deploying the code to GitHub, you need to:

1. **Set up the OPENAI_API_KEY secret**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
   - Click "Add secret"

2. **Set up GitHub Pages**:
   - Go to your repository → Settings → Pages
   - Select "GitHub Actions" as the source
   - The GitHub workflow will automatically deploy your site

3. **Alternative Hosting Options**:
   - **Netlify**: Connect your GitHub repository to Netlify
   - **Vercel**: Connect your GitHub repository to Vercel
   - **Railway/Render**: These platforms can deploy directly from GitHub

## Continuous Deployment

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically:

1. Build your project whenever you push to the `main` branch
2. Deploy the built files to GitHub Pages

## Troubleshooting

- **Build fails**: Make sure the OPENAI_API_KEY secret is set correctly
- **Missing dependencies**: Run `npm install` before deploying
- **GitHub Pages not working**: Check that GitHub Pages is enabled in repository settings

## Need Help?

If you encounter any issues during deployment, please refer to:

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

Or raise an issue in the repository for specific assistance.