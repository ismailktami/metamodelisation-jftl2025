import { test, expect } from '@playwright/test';
import { Util } from './util.js';
const formConfigs = Util.loadJsonFiles('datas');

formConfigs.forEach(formConfig => {
  for (const rule of formConfig.rules.filter(rule => rule.conditionType === 'NONE_FIELDS_VALID')) {
    const actionsTitle = rule.actionStates.map(a => `${a.alias.toUpperCase()} should be ${a.state.replace('toBe', '').toLowerCase()}`).join(', ');
    test(`[${formConfig.formName}][NONE_FIELDS_VALID] ${actionsTitle}`, async ({ page }) => {
      await page.goto(formConfig.formLink);
      let inputs = {};
      for (const field of formConfig.fields) {
        inputs[field.id] = Util.generateInvalidInput(field);
      }
      await Util.applyInputs(page, inputs);
      for (const actionState of rule.actionStates) {
        const action = formConfig.actions.find(action => action.alias === actionState.alias);
        await expect(page.locator(`#${action['id']}`))[actionState.state];
      }
    });

  }
});
