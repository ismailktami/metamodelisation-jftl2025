import { test, expect } from '@playwright/test';
import { Util } from './util.js';
const formConfigs = Util.loadJsonFiles('datas');

formConfigs.forEach(formConfig => {
  for (const rule of formConfig.rules.filter(rule => rule.conditionType === 'SPECIFIC_FIELD_VALID')) {
    for (const item of rule.values) {
      for (const [key, value] of Object.entries(item)) {
        test(`[${formConfig.formName}][SPECIFIC_FIELD_VALID ${key.toUpperCase()}] Submit should be enabled and reset should be disabled`, async ({ page }) => {
          await page.goto(formConfig.formLink);
          let inputs = {};
          for (const field of formConfig.fields) {
            inputs[field.id] = field.id === key ? value : Util.generateValidInput(field);
          }
          await Util.applyInputs(page, inputs);
          for (const actionState of rule.actionStates) {
            const action = formConfig.actions.find(action => action.alias === actionState.alias);
            await expect(page.locator(`#${action['id']}`))[actionState.state]
          }
        });
      }
    }
  }
});
