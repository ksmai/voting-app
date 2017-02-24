# voting-app
## Introduction
  * A simple web application for voting
  * Allows creating polls, viewing results and voting easily
  * Supports authentication through Facebook, Twitter and Github

## Live demo
http://ks-voting-app.herokuapp.com/

## To install
```
git clone https://github.com/ksmai/voting-app.git
cd voting-app
```

## To start
Configure the following variables in config.json:
```
"PORT"               : "The port used by the application",
"FB_CLIENT_ID"       : "Client ID of Facebook app",
"FB_CLIENT_SECRET"   : "Client Secret of Facebook app",
"TW_CONSUMER_KEY"    : "Consumer Key of Twitter application",
"TW_CONSUMER_SECRET" : "Consumer Secret of Twitter application",
"GH_CLIENT_ID"       : "Client ID of Github application",
"GH_CLIENT_SECRET"   : "Client Secret of Github application"
```
Alternatively, use environment variables of the same name.

## License
ISC
