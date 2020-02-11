var http = require('http');
var url = require('valid-url');
var md5 = require('md5');
var morgan = require('morgan')

const puppeteer = require('puppeteer');

let env_secret = process.env.SECRET_TOKEN;
console.log("SECRET_TOKEN=" + env_secret);

let browser

// if environment port is not set, default to 3000
var port = process.env.PORT || '3000';

var express = require('express');
var app = express();

app.set('port', port);

app.use(morgan(':method :url (:status) :response-time ms'));
app.get('/live', async (req, res, next) => {
    res.writeHead(200, [
        ['Content-Type', 'appplication/json'],
        ['Cache-Control', 'Cache-Control:max-age=0'],
    ]);
    res.end('up')

});

app.get('/', async (req, res, next) => {

    let width = req.query.width,
        height = req.query.height,
        website = req.query.url,
        deviceScaleFactor = req.query.deviceScaleFactor || 1,
        providedSecret = req.query.secret;

    let calcBuffer = env_secret + "\n";

    Object.keys(req.query).forEach(function (element, key) {
        if (element !== 'secret') {
            calcBuffer += element + '=' + req.query[element] + "\n";
        }
    });

    let calcSecret = md5(calcBuffer);
    if (providedSecret !== calcSecret && env_secret !== 'testing') {
        res.status(422);
        return res.json({ message: 'secret not match' });
    }

    if (isNaN(width) || width < 180 || width > 5120) {
        res.status(422);
        return res.json({ message: 'please make sure the width is numeric and greater than 180 and less than 5120' });
    }
    if (isNaN(height) || height < 180 || height > 5120) {
        res.status(422);
        return res.json({ message: 'please make sure the height is numeric and greater than 180 and less than 5120' });
    }
    if (!url.isUri(website)) {
        res.status(422);
        return res.json({ message: 'please make sure the url is valid' });
    }

    try {
        console.log(`Loading ${website}`);

        const page = await browser.newPage();
        await page.setViewport({
            deviceScaleFactor: Number.parseFloat(deviceScaleFactor),
            width: Number.parseInt(width, 10),
            height: Number.parseInt(height, 10),
        });

        await page.goto(website, { waitUntil: 'networkidle2' });

        console.log(`${website} loaded`);

        page.screenshot({
            type: 'jpeg',
            quality: 90,
        }).then(async (buffer) => {
            res.writeHead(200, [
                ['Content-Type', 'image/jpeg'],
                ['Cache-Control', 'Cache-Control:max-age=2629743'],
            ]);

            res.end(new Buffer(buffer));
        });

    } catch (error) {
        // Passes errors into the error handler
        return next(error)
    }

});


puppeteer.launch({
    args: [
        // Required for Docker version of Puppeteer
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // This will write shared memory files into /tmp instead of /dev/shm,
        // because Docker’s default for /dev/shm is 64MB
        '--disable-dev-shm-usage'
    ]
}).then(async function (the_browser) {
    browser = the_browser;

    console.log(`Starting browser...`);
    const browserVersion = await browser.version();
    console.log(`Started ${browserVersion}`);

    console.log(`Listening to port ${port}...`);
    http.createServer(app).listen(port);


})
