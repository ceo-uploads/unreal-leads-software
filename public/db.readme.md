Git CLI Codes ->
    Initialize and Stage :
        git init
        git add .
        git commit -m "Initial commit for Unreal Leads"
        git branch -M main

    Connect to your GitHub Repo :
        git remote add origin https://github.com/ceo-uploads/unreal-leads-software

    Push to GitHub :
        git push -u origin main

    Git Verification - CLI - Terminal AUTH :
        git config --global user.email "your-github-email@example.com"
        git config --global user.name "Your GitHub Username"

    Pull the remote changes :
        git pull origin main --allow-unrelated-histories

    Increase the Git Post Buffer :
        git config --global http.postBuffer 1048576000