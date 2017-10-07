# Payment Handling Web App

## Paypal account setup

Make sure you have Paypal and Braintree account

Copy `config.sample.json` to `config.json`, and fill in the keys inside `config.json` 

## Development environment setup

1. Make sure you have docker, node and npm/yarn installed

2. Install the packages
```
cd app
yarn install / npm install
```

3. Copy the contents of `.env.example` to `.env`, fill in the constants.

4. Starting the server
```
docker-compose up -d
```

Now it should be up at port 8000

## Deployment

This repository support deployment to Heroku

Make sure you have registered Heroku account and installed heroku-cli

```
heroku login
heroku container:push web
heroku open
``` 