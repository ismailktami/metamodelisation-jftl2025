import { test, expect } from '@playwright/test';
import accountForm from '../fixtures/accountFormWithRegx.json';

interface TestCase {
  testCaseName: string;
  inputs: Record<string, string | number>;
  expectations: Record<string, string>[];
}

interface AccountForm {
  pageLink: string;
  testCases: TestCase[];
}

const accountFormData: any = accountForm;

test.describe('[Create Account] Dynamic Form Tests', () => {
  accountFormData.testCases.forEach((testCase) => {
    test.only(`[Create Account]: ${testCase.testCaseName}`, async ({ page }) => {
      // Naviguer vers la page
      await page.goto(accountFormData.pageLink);

      // Remplir les champs du formulaire
      for (const [fieldId, value] of Object.entries(testCase.inputs)) {
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
          const element = page.locator(`[data-testid="${actionTestId}"]`);

          // Utiliser les assertions de Playwright
          switch (expectedState) {
            case 'visible':
              await expect(element).toBeVisible();
              break;
            case 'hidden':
              await expect(element).toBeHidden();
              break;
            case 'enabled':
              await expect(element).toBeEnabled();
              break;
            case 'disabled':
              await expect(element).toBeDisabled();
              break;
            default:
              throw new Error(`État non pris en charge : ${expectedState}`);
          }
        }
      }
    });
  });
});