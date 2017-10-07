FROM mhart/alpine-node:8

# Heroku must use /app as the working directory
WORKDIR app
ENV HOME="/app"

COPY ./app .

# Install dev dependency for building
RUN yarn install

# Build the bundle with webpack
ENV NODE_ENV production
RUN yarn run build

# Clean up the files
RUN rm -rf src/

# Install only production packages
RUN rm -rf node_modules/
RUN yarn install

# Use non-root user to run the server
RUN adduser -D normal_user
USER normal_user

# Expose port for development server, ignored by Heroku
EXPOSE 8000

CMD ["yarn", "run", "start"]