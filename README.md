# Payment Handling Web App

## Development environment setup

Make sure you have docker installed, then:

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