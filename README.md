# Payment Handling Web App

## Accounts setup

Make sure you have Paypal and Braintree account

For Braintree, besides create an account, you need to prepare multiple merchant accounts for different currencies:

1. Login to [the sandbox dashboard](https://sandbox.braintreegateway.com)

2. Navigate `Settings` at the navigation bar

3. Select `Processing` from the dropdown menu

4. Scroll to the bottom, Click `New Sandbox Merchant Account`

5. Set up three merchants with Metchant Account ID:
    - `CNY` (deselect "Accept PayPal")
    - `JPN`
    - `HKD`

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

Also entered the credit card to gain access to Heroku Redis add-on

```
heroku login
heroku container:push web
heroku open
``` 

Set the enviornments variable defined in `.env.sample` in Heroku Dashboard

## Misc issues

- For Paypal sandbox environment, only few testing card can pass the validation. Please use the testing card provided in Personal account. Otherwise Paypal will most likely return 500 - 503 response error when doing transactions.
