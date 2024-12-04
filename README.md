# Simple Tracker

Write a Node.js application that

* receives HTTP POST requests only on a "/track" route
* gets data in JSON format passed in the request body
* saves the JSON data into a local file (append)
* if the data contains a "count" parameter, the application increments the value of the "count" key by the value of the 'count' parameter in a Redis database
* receives HTTP GET requests only on a "/count" route
* returns the value of the "count" key from the Redis database
* Write appropriate unit tests.

## Description

A simple app for the purposes of an interview.

Technologies: NestJs, NodeJs, Jest, Supertest, TestContainers, Swagger, Typescript, BullMQ, Redis, Docker

## Quick start

* Run the docker compose (this will start up the app, Redis, and setup basic https):

```bash
$ docker-compose up --build
```

* Navigate to: https://localhost - you should see Swagger API UI
* Should you like to monitor what is stored in Redis, you can do so here: http://localhost:5540
  * Just use `redis` as the hostname for connecting to the database (standard port 6379)

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

This requires a local Redis running, see the `.env` file for basic settings (or use the docker compose above).

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```
