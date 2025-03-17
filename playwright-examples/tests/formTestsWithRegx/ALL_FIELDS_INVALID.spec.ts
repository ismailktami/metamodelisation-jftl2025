import { test, expect } from '@playwright/test';
import { Util } from './util.js';
const formConfigs = Util.loadJsonFiles('datas');
formConfigs.forEach(formConfig => {
  for (const rule of formConfig.rules.filter(rule => rule.conditionType === 'ALL_FIELDS_INVALID')) {
    test(`[${formConfig.formName}][ALL_FIELDS_INVALID] Submit should be enabled and reset should be enabled`, async ({ page }) => {
      await page.goto(formConfig.formLink);
      let inputs = {};
      for (const field of formConfig.fields) {
        const generatedValue = Util.generateInvalidInput(field);
        if (generatedValue)
          inputs[field.id] = generatedValue;
      }
      await Util.applyInputs(page, inputs);
      for (const actionState of rule.actionStates) {
        const action = formConfig.actions.find(action => action.alias === actionState.alias);
        await expect(page.locator(`#${action['id']}`))[actionState.state]
      }
    });
  }
});