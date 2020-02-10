
sudo docker run -e 'SECRET_TOKEN=testing' -l 3000:3000 -v $(pwd):/app/ --rm appcivico/puppeteer-as-http:latest  npm run dev

