Push-Location ./webapp/transcriptionviewer

npm install 

# Install Angular CLI (ng)
npm install -g @angular/cli

# Build the SPA for prod distribution
ng build --prod

Pop-Location