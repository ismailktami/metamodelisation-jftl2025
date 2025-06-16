import formConfig from './accountFormWithoutDatas.json';
import RandExp from 'randexp';

function generateValidInput(field) {
  if (field.type === 'select') {
    if (field.options && field.options.length > 0) {
      const randomIndex = Math.floor(Math.random() * field.options.length);
      return field.options[randomIndex];
    }
  }

  if (field.regex && field.type !== "email" && field.type !== "number") {
    return new RandExp(field.regex).gen();
  }
  if (field.type === "email") {
    return "valid@example.com"
  }
  if (field.type === "number") {
    return 19
  }
  // Fallback pour les autres types
  return 'ValidValue';
}

function generateInvalidInput(field) {
  if (field.type === 'number') {
    return '-999'; // Exemple d'une valeur invalide
  }
  if (field.type === 'email') {
    return 'invalidemail'; // Email invalide
  }
  if (field.type === 'password') {
    return 'weak'; // Mot de passe invalide
  }
  if (field.type === 'input' && field.id === 'username') {
    return 'use'; // Username invalide
  }
  // Fallback pour les autres types
  return 'InvalidValue412@';
}

function applyInputs(inputs) {
  Object.entries(inputs).forEach(([fieldId, value]) => {
    cy.get(`#${fieldId}`).then(($el) => {
      const elType = $el.prop("tagName").toLowerCase();
      if (elType === "select") {
        cy.get(`#${fieldId}`).select(value.toString());
      } else {
        cy.get(`#${fieldId}`).focus().clear().type(value.toString());
        
      }
    });
  });
}

describe(`[${formConfig.formName}] Dynamic Form Tests`, () => {
  it("[NONE_FILLED] All actions should be disbled",()=>{
      cy.visit(formConfig.formLink);
      formConfig.actions.forEach((action)=>{
        cy.get(`[data-testid="${action['data-testid']}"]`).should('be.'+action.defaultState);
      })
  })
  // Parcourir chaque règle
  formConfig.rules.filter((rule) => rule.conditionType === 'ANY_FIELD_INVALID').forEach((rule) => {
    const { fields, actionStates } = rule;
    fields.forEach((invalidFieldId) => {
      const testName = `[INVALID ${invalidFieldId.toUpperCase()}] Submit should be enabled and reset should be disabled`;
      it(testName, () => {
        cy.visit(formConfig.formLink);

        // Préparer les inputs : tous les champs remplis avec des données valides sauf un
        let inputs = {};

        formConfig.fields.forEach((field) => {
          if (field.id === invalidFieldId) {
            inputs[field.id] = generateInvalidInput(field);
          } else {
            inputs[field.id] = generateValidInput(field);
          }
        });
        applyInputs(inputs);

  actionStates.forEach(actionState => {
    const action = formConfig.actions.find(action => action.alias === actionState.alias);
    cy.get(`[data-testid="${action['data-testid']}"]`).should('be.'+actionState.state);
  });
      });
    });
  });
  
  formConfig.rules.filter((rule) => rule.conditionType === 'ANY_FIELD_EMPTY').forEach((rule) => {
    const { fields, actionStates } = rule;
    fields.forEach((invalidFieldId) => {
      const testName = `[EMPTY ${invalidFieldId.toUpperCase()}] Submit should be enabled and reset should be disabled`;
      it(testName, () => {
        cy.visit(formConfig.formLink);
        let inputs = {};
        formConfig.fields.forEach((field) => {
          if (field.id === invalidFieldId) {
            inputs[field.id] = " ";
          } else {
            inputs[field.id] = generateValidInput(field);
          }
        });
        applyInputs(inputs);

  actionStates.forEach(actionState => {
    const action = formConfig.actions.find(action => action.alias === actionState.alias);
    cy.get(`[data-testid="${action['data-testid']}"]`).should('be.'+actionState.state);
  });
      });
    });
  });

  formConfig.rules.filter((rule) => rule.conditionType === 'ALL_FIELDS_VALID').forEach((rule) => {
    const { actionStates } = rule;
      const testName = `[ALL_FIELDS_VALID ] Submit should be enabled and reset should be enabled`;
      it(testName, () => {
        cy.visit(formConfig.formLink);
        let inputs = {};
        formConfig.fields.forEach((field) => {
            inputs[field.id] = generateValidInput(field);
        });
        applyInputs(inputs);
        actionStates.forEach(actionState => {
          const action = formConfig.actions.find(action => action.alias === actionState.alias);
          cy.get(`[data-testid="${action['data-testid']}"]`).should('be.'+actionState.state);
        });
    });
  });
});
