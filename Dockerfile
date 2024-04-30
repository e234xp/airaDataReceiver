FROM node:18-alpine
WORKDIR /app
ADD . .
RUN npm install
RUN npm run bundle

FROM node:18-alpine
WORKDIR /app
COPY --from=0 /app/bundle.js /app/bundle.js
COPY --from=0 /app/node_modules /app/node_modules
CMD ["./bundle.js"]