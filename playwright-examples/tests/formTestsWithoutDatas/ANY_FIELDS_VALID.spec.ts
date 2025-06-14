import { test, expect } from '@playwright/test';
import { Util } from './util.js';
const formConfigs = Util.loadJsonFiles('datas');

formConfigs.forEach(form=>{
  for (const rule of form.rules.filter(rule => rule.conditionType === 'ANY_FIELD_INVALID')) {
    for (const invalidFieldId of rule.fields) {
      const actionsTitle = rule.actionStates.map(a => `${a.alias.toUpperCase()} should be ${a.state.replace('toBe', '').toLowerCase()}`).join(', ');

      test(`[${form.formName}][${form.formName}][INVALID ${invalidFieldId.toUpperCase()}] ${actionsTitle}`, async ({ page }) => {
        await page.goto(form.formLink);
        let inputs = {};
        for (const field of form.fields) {
          inputs[field.id] = field.id === invalidFieldId ? Util.generateInvalidInput(field) : Util.generateValidInput(field);
        }
        await Util.applyInputs(page, inputs);
        for (const actionState of rule.actionStates) {
          const action = form.actions.find(action => action.alias === actionState.alias);
          await expect(page.locator(`#${action['id']}`))[actionState.state]
        }
      });
    }
  }
})
