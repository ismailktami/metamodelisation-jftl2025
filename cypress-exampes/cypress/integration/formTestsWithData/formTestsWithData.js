import accountForm from "./accountFormWithData.json";

describe("[Create Account] Dynamic Form Tests", () => {
  accountForm.testCases.forEach((testCase) => {

    it.only(`[Create Account]: ${testCase.testCaseName}`, () => {
      cy.visit(accountForm.pageLink);
      Object.entries(testCase.inputs).forEach(([fieldId, value]) => {
        cy.get(`#${fieldId}`).then(($el) => {
          const elType = $el.prop("tagName").toLowerCase();
          if (elType === "select") {
            console.log(`Selecting value for ${fieldId}: ${value}`);
            cy.get(`#${fieldId}`).select(value.toString());
          } else {
            cy.get(`#${fieldId}`).clear().type(value.toString());
          }
        });
      });
      testCase.expectations.forEach((expectation) => {
        Object.entries(expectation).forEach(([actionTestId, expectedState]) => {
            cy.get(`[data-testid="${actionTestId}"]`).should("be."+expectedState);
          });
      });
    });
  });
});