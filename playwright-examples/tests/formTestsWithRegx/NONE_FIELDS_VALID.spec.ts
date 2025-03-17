import { test, expect } from '@playwright/test';
import { Util } from './util.js';
const formConfigs = Util.loadJsonFiles('datas');

formConfigs.forEach(formConfig => {
  test(`[${formConfig.formName}][NONE_FILLED] All actions should be on default state`, async ({ page }) => {
    await page.goto(formConfig.formLink);
    for (const action of formConfig.actions) {
      await expect(page.locator(`#${action['id']}`))[action.defaultState]();
    }
  });
});