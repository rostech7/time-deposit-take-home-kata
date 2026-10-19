FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app
ENV CI=true
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY tsconfig.json tsconfig.build.json ./
COPY scripts ./scripts
COPY src ./src
RUN yarn build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json yarn.lock ./
# Package managers are not needed at runtime; removing them drops their known vulnerabilities from the image.
RUN yarn install --frozen-lockfile --production && yarn cache clean \
  && rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx \
     /usr/local/bin/yarn /usr/local/bin/yarnpkg /opt/yarn-*
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
