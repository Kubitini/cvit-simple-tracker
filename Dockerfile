FROM node:20 as build

WORKDIR /usr/src/app

COPY . .

ENV NODE_ENV production

RUN npm ci --only=production

RUN npm run build

FROM node:20-alpine as main

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist/ ./dist
COPY --from=build /usr/src/app/node_modules/ ./node_modules

EXPOSE 3000

CMD ["node", "dist/main"]