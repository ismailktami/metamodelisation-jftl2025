import { test, expect } from '@playwright/test';
const formConfigs = Util.loadJsonFiles('datas');
import { Util } from './util.js';

formConfigs.forEach(formConfig=>{
for (const rule of formConfig.rules.filter(rule => rule.conditionType === 'ANY_FIELD_EMPTY')) {
  for (const emptyFieldId of rule.fields) {
    const actionsTitle = rule.actionStates.map(a => `${a.alias.toUpperCase()} should be ${a.state.replace('toBe', '').toLowerCase()}`).join(', ');

    test(`[${formConfig.formName}][EMPTY ${emptyFieldId.toUpperCase()}] ${actionsTitle}`, async ({ page }) => {
      await page.goto(formConfig.formLink);
      let inputs = {};
      for (const field of formConfig.fields) {
        inputs[field.id] = field.id === emptyFieldId ? " " : Util.generateValidInput(field);
      }
      await Util.applyInputs(page, inputs);
      for (const actionState of rule.actionStates) {
        const action = formConfig.actions.find(action => action.alias === actionState.alias);
        await expect(page.locator(`#${action['id']}`))[actionState.state]
      }
    });
  }
}});