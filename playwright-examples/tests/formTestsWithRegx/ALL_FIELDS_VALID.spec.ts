import { test, expect } from '@playwright/test';
import { Util } from './util.js';
const formConfigs = Util.loadJsonFiles('datas');
formConfigs.forEach(formConfig=>{
  for (const rule of formConfig.rules.filter(rule => rule.conditionType === 'ALL_FIELDS_VALID')) {
    test(`[${formConfig.formName}][ALL_FIELDS_VALID] Submit should be enabled and reset should be enabled`, async ({ page }) => {
      await page.goto(formConfig.formLink);
      let inputs = {};

      for (const field of formConfig.fields) {
          inputs[field.id] = Util.generateValidInput(field);
      }
      await Util.applyInputs(page, inputs);
      
      for (const actionState of rule.actionStates) {
        const action = formConfig.actions.find(action => action.alias === actionState.alias);
        await expect(page.locator(`#${action['id']}`))[actionState.state]
      }
    });
  }
});