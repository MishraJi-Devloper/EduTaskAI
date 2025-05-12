# Deploying EduTask AI to GitHub

This project will be deployed to the existing repository: https://github.com/MishraJi-Devloper/EduTaskAI

There are two ways to deploy this project:

## Option 1: Using the deployment script (Command Line)

1. Make sure you have Git installed on your computer
2. The repository is already created at https://github.com/MishraJi-Devloper/EduTaskAI
3. Run the deployment script:
   ```
   ./deploy-to-github.sh
   ```
4. Follow the instructions provided by the script

## Option 2: Manual Deployment through GitHub Web Interface

1. The repository already exists at https://github.com/MishraJi-Devloper/EduTaskAI

2. Upload the files using GitHub's web interface
   - Click "uploading an existing file" on the new repository page
   - Drag and drop or select all the files from your project
   - Commit the changes

3. Set up GitHub Pages
   - Go to the repository's Settings
   - Navigate to the "Pages" section
   - Select "GitHub Actions" as the source
   - The GitHub workflow will automatically deploy your site

4. Add your OpenAI API Key
   - Go to the repository's Settings
   - Navigate to "Secrets and variables" > "Actions"
   - Click "New repository secret"
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
   - Click "Add secret"

5. Trigger a manual deployment
   - Go to the "Actions" tab
   - Select the "Deploy to GitHub Pages" workflow
   - Click "Run workflow"

6. View your deployed site
   - Once the deployment is complete, a link will be provided in the workflow run
   - Your site will be available at `https://your-username.github.io/edutask-ai/`

## Alternative Hosting Options

This project includes configuration files for multiple hosting platforms:

1. **Netlify**
   - Connect your GitHub repository to Netlify
   - It will automatically use the `netlify.toml` configuration

2. **Vercel**
   - Connect your GitHub repository to Vercel
   - It will automatically use the `vercel.json` configuration

3. **Railway/Render/Heroku**
   - These platforms can deploy directly from GitHub
   - Make sure to set your `OPENAI_API_KEY` in the environment variables

Remember to keep your OpenAI API key secure and never commit it directly to your repository!