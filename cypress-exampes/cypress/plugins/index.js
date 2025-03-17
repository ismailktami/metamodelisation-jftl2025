const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const { NodeModulesPolyfillPlugin } = require('@esbuild-plugins/node-modules-polyfill');
const { beforeRunHook, afterRunHook } = require('cypress-mochawesome-reporter/lib');
const fs = require('fs');
const path = require('path');

module.exports = async (on, config) => {
  //Set cucumber preprocessor
  await addCucumberPreprocessorPlugin(on, config);

  on('task', {
    readTestFiles(directory) {
      const folderPath = path.resolve(directory);
      const files = fs.readdirSync(folderPath);
      return files.map(file => ({
        name: file,
        content: fs.readFileSync(path.join(folderPath, file), 'utf-8')
      }));
    }
  });

  on('before:run', async (details) => {
    await beforeRunHook(details);
  });

  //Utilisez la configuration Esbuild pour le préprocesseur
  on(
    'file:preprocessor',
    createBundler({
      plugins: [NodeModulesPolyfillPlugin(), createEsbuildPlugin(config, {})],
    }),
  );

  on('after:run', async () => {
    await afterRunHook();
  });
  return config;
};
