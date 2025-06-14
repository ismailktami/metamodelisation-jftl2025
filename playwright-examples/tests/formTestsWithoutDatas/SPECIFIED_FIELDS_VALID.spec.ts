import { test, expect } from '@playwright/test';
import { Util } from './util.js';
const formConfigs = Util.loadJsonFiles('datas');

formConfigs.forEach(formConfig => {
  for (const rule of formConfig.rules.filter(rule => rule.conditionType === 'SPECIFIED_FIELDS_VALID')) {
    for (const item of rule.values) {
      const actionsTitle = rule.actionStates.map(a => `${a.alias.toUpperCase()} should be ${a.state.replace('toBe', '').toLowerCase()}`).join(', ');
      for (const [key, value] of Object.entries(item)) {
        test(`[${formConfig.formName}][SPECIFIED_FIELDS_VALID ${key.toUpperCase()}] ${actionsTitle}`, async ({ page }) => {
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
