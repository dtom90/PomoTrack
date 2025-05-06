FROM cypress/included:13.15.2
RUN yarn add typescript@~5.8.0
RUN yarn add @4tw/cypress-drag-drop@2.2.5
COPY tsconfig.* /opt/app/
COPY cypress.config.ts /opt/app/
COPY cypress /opt/app/cypress
WORKDIR /opt/app
