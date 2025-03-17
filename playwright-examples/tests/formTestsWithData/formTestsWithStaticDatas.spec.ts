import { test, expect } from '@playwright/test';
import accountForm from './accountFormWithStaticDatas.json';
const checkElementState = async (element, state) => {
  await expect(element)[state]();
};

interface TestCase {
  testCaseName: string;
  datas: Record<string, string | number>;
  expectations: Record<string, string>[];
}

interface AccountForm {
  pageLink: string;
  testCases: TestCase[];
}

const accountFormData: AccountForm = accountForm;

test.describe('[Create Account] Dynamic Form Tests', () => {
  accountFormData.testCases.forEach((testCase) => {
    test.only(`[Create Account]: ${testCase.testCaseName}`, async ({ page }) => {
      // Naviguer vers la page
      await page.goto(accountFormData.pageLink);

      // Remplir les champs du formulaire
      for (const [fieldId, value] of Object.entries(testCase.datas)) {
        const element = page.locator(`#${fieldId}`);
        const tagName = await element.evaluate((el) => el.tagName.toLowerCase());

        if (tagName === 'select') {
          await element.selectOption(value.toString());
        } else {
          await element.fill(value.toString());
        }
      }

      // Vérifier les attentes
      for (const expectation of testCase.expectations) {
        for (const [actionTestId, expectedState] of Object.entries(expectation)) {
          var element = page.locator(`[id="${actionTestId}"]`);
          checkElementState(element,expectedState)
        }
      }
    });
  });
});