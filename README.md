# Payment Handling Web App

## Demo

https://quiet-everglades-93004.herokuapp.com/

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

1. Make sure you have `docker` installed

2. Copy the contents of `.env.example` to `.env`, fill in the constants.

3. Start the server
    ```
    docker-compose up -d
    ```

Now it should be up at `localhost:${PORT}` (Default `PORT` is `8000`)

Changing client side source code will rebuild automatically, refresh browser to take effect.

Changing server side source code need to restart to take effect:

```
docker-compose down
docker-compsoe up -d
```

## Deployment

This repository support deployment to Heroku

Make sure you have registered Heroku account and installed heroku-cli

Also entered the credit card to gain access to Heroku Redis add-on

```
heroku login
heroku container:login
heroku create
heroku container:push web
heroku open
``` 

Set the enviornments variable defined in `.env.sample` in Heroku Dashboard

## Data structure

The payment data from payment form is in structure:
```
{
    orderCustomer: 'Hin' // The customer name
    orderPhone: '123456789' // The customer phone number
    orderPrice: 323.3 // The order price
    orderCurrency: 'USD' // (HKD, USD, AUD, EUR, JPY, CNY)

    cardHolder: 'Hin' // The credit card holder full name
    cardNumber: '4242 4242 4242 4242' // The credit card number
    cardExpiry: '03/33' // The expiry date
    cardCvc: '333' // The card CVC code
}
```

After successful payment, the record is stored in Redis with key composed with `orderCustomer` and `paymentID`.
The record data structure: 
```
{
    orderCustomer: 'Hin' // The customer name
    orderPhone: '123456789' // The customer phone number
    orderPrice: 323.3 // The order price
    orderCurrency: 'USD' // (HKD, USD, AUD, EUR, JPY, CNY)
    paymentID: 'PAY-123456789' // The payment ID from the 3rd party gateway
    gateway: 'paypal' // The 3rd party gateway name
    response: {...} // The full response object from 3rd party API
}
```

## Misc issues

- For Paypal sandbox environment in production environment, only few testing card can pass the validation. Please use the testing card provided in Personal account. Otherwise Paypal will most likely return 500 - 503 response error when doing transactions.
