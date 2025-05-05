import { defineConfig } from 'cypress'

// import 'cypress'

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.{ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(on: Cypress.PluginEvents, _config: Cypress.PluginConfigOptions) {
      // implement node event listeners here
      on('task', {
        log (message) {
          // eslint-disable-next-line no-console
          console.log(message)
          return null
        }
      })
    }
  }
})
