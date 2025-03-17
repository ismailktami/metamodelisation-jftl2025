const { defineConfig } = require('cypress');

module.exports = defineConfig({
  chromeWebSecurity: false,
  video: false,
  viewportWidth: 1800,
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    specPattern: ['cypress/integration/**/*.feature','cypress/integration/**/*.js'],
    supportFile: 'cypress/support/index.js',
    env: {
      ENV: 'recette',
    },
  },
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'cypress-mochawesome-reporter, mocha-junit-reporter',
    cypressMochawesomeReporterReporterOptions: {
      reportDir: 'cypress/reports',
      charts: true,
      reportPageTitle: 'Bff Customer Portal Tests',
      embeddedScreenshots: true,
      inlineAssets: true,
    },
    mochaJunitReporterReporterOptions: {
      mochaFile: 'cypress/reports/junit/results-[hash].xml',
    },
  },
  downloadsFolder: 'cypress/fixtures/downloads',
  defaultCommandTimeout: 2500,
  requestTimeout: 5000,
  retries: 0,
});
