FROM mhart/alpine-node:8

# use yarn instead of npm for better package management
RUN apk add --no-cache yarn

# Heroku must use /app as the working directory
WORKDIR app
ENV HOME="/app"
ENV NODE_ENV production

COPY ./app .

RUN yarn install

# Use non-root user to run the server
RUN adduser -D normal_user
USER normal_user

# Expose port for development server, ignored by Heroku
EXPOSE 8000

CMD ["yarn", "run", "start"]