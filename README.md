# First steps:

Build the container image:

    docker-compose build

Run the containers with default settings:

    docker-compose up

Edit `.env` to change the default values:

    BACKEND_SECRET_TOKEN=testing
    NGINX_DATA_DIR=/tmp/nginx-cache

> Note: edit `proxy_cache_path` on `nginx.conf` to change the configured *10GB* cache size.

# backend/src/app.js

This application runs a headless chrome and then take a screenshot, and optionally resize the image.


It has a `/live` endpoint that always returns 200 and can be used to monitor the heath of this worker.
It has a `/i.jpg` endpoint that returns the image.

## i.jpg accepted query string params:

    w or width _ required - set browser width
    h or height _ required - set browser height
    u or url _ required - which url to load
    a or secret _ required - request signature
    dsf or deviceScaleFactor _ Default 1
    fp _ set to 1 to take a full page image instead of setting a max height
    rw or resize_width - set resize width of final image
    ms or wait_ms - how many miliseconds wait after networkidle0 before taking the screenshot

# Signing an URL:

    1. Init the string with the secret + "\n"
    2. Append each parameter with parameter-key + "=" + parameter-value + "\n"
    3. Make sure it's encoded as UTF-8 string, convert it to bytes and then convert it into MD5 as hex

    use the md5 hex as `a` parameter

# Signing an URL using gen-secret-url.pl

> Requires perl with Mojolicious installed

Run the script:

    BACKEND_SECRET_TOKEN=testing perl gen-secret-url.pl http://172.17.0.1:30666/i.jpg https://www.google.com/a/appcivico.com 720 480

Should output http://172.17.0.1:30666/i.jpg?u=https%3A%2F%2Fwww.google.com%2Fa%2Fappcivico.com&w=720&h=480&fp=1&ms=1&a=9e49cf891be5cb22c77827fd46687040


