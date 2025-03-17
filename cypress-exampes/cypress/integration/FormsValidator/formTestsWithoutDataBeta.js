import formConfig from '../../fixtures/accountFormWithoutData.json';
import RandExp from 'randexp';

// Fonctions pour générer des inputs valides et invalides
function generateValidInput(field) {
  if (field.type === 'select') {
    // Sélectionner aléatoirement une option
    if (field.options && field.options.length > 0) {
      const randomIndex = Math.floor(Math.random() * field.options.length);
      return field.options[randomIndex];
    }
    return 'ValidOption'; // Fallback si pas d'options
  }

  if (field.regex) {
    return new RandExp(field.regex).gen();
  }

  // Fallback pour les autres types
  return 'ValidValue';
}

function generateInvalidInput(field) {
  if (field.type === 'number') {
    return '-999'; // Exemple d'une valeur invalide
  }
  if (field.type === 'email') {
    return 'invalidemail@com'; // Email invalide
  }
  if (field.type === 'password') {
    return 'weak'; // Mot de passe invalide
  }
  if (field.type === 'input' && field.id === 'username') {
    return 'invalidUsername'; // Username invalide
  }
  // Fallback pour les autres types
  return 'InvalidValue';
}

// Fonction pour appliquer les inputs selon une stratégie
function applyInputs(inputs) {
  Object.entries(inputs).forEach(([fieldId, value]) => {
    cy.get(`#${fieldId}`).then(($el) => {
      const elType = $el.prop("tagName").toLowerCase();
      if (elType === "select") {
        cy.get(`#${fieldId}`).select(value.toString());
      } else {
        cy.get(`#${fieldId}`).clear().type(value.toString());
      }
    });
  });
}

describe(`[${formConfig.formName}] Dynamic Form Tests`, () => {

  formConfig.rules.forEach((rule) => {
    const { conditionType, fields, actionStates } = rule;

    // Générer les noms des tests
    const testNameConditionMet = `Should set buttons as per rule when condition "${conditionType}" is met`;
    const testNameConditionNotMet = `Should set buttons to default state when condition "${conditionType}" is not met`;

    it(testNameConditionMet, () => {
      cy.visit(formConfig.formLink);

      let inputs = {};

      switch (conditionType) {
        case 'ALL_FIELDS_VALID':
          // Remplir tous les champs avec des valeurs valides
          formConfig.fields.forEach(field => {
            if (field.id) {
              inputs[field.id] = generateValidInput(field);
            }
          });
          break;

        case 'ANY_INVALID':
          // Remplir tous les champs avec des valeurs valides sauf un avec une valeur invalide
          if (fields.length > 0) {
            const randomInvalidField = fields[Math.floor(Math.random() * fields.length)];
            fields.forEach(fieldId => {
              const field = formConfig.fields.find(f => f.id === fieldId);
              if (field) {
                inputs[fieldId] = fieldId === randomInvalidField ? generateInvalidInput(field) : generateValidInput(field);
              }
            });
          }
          break;

        case 'NONE_FILLED':
          // Ne remplir aucun des champs spécifiés
          // Aucune action nécessaire puisque les champs restent vides
          break;

        default:
          cy.log(`Condition type "${conditionType}" non gérée.`);
          break;
      }

      // Appliquer les inputs si nécessaire
      if (Object.keys(inputs).length > 0) {
        applyInputs(inputs);
      }

      // Vérifier l'état des boutons selon `actionStates`
      formConfig.actions.forEach(action => {
        const testId = action['data-testid'];
        const expectedState = actionStates[testId];

        if (expectedState === 'enable') {
          cy.get(`[data-testid="${testId}"]`).should('not.be.disabled');
        } else if (expectedState === 'disable') {
          cy.get(`[data-testid="${testId}"]`).should('be.disabled');
        } else if (expectedState === 'enabled') {
          cy.get(`[data-testid="${testId}"]`).should('not.be.disabled');
        }
      });
    });

    it(testNameConditionNotMet, () => {
      cy.visit(formConfig.formLink);

      let inputs = {};

      switch (conditionType) {
        case 'ALL_FIELDS_VALID':
          // Ne remplir pas tous les champs ou rendre un champ invalide
            const formConfigSliced = formConfig.fields.slice(0, -1);
            const fieldsToFill = formConfigSliced; // Laisser le dernier champ vide
            fieldsToFill.forEach(field => {
              if (field) {
                inputs[field.id] = generateValidInput(field);
              }
            });
          break;

        case 'ANY_INVALID':
          // Remplir tous les champs avec des valeurs valides pour ne pas avoir d'invalidité
          fields.forEach(fieldId => {
            const field = formConfig.fields.find(f => f.id === fieldId);
            if (field) {
              inputs[fieldId] = generateValidInput(field);
            }
          });
          break;

        case 'NONE_FILLED':
          // Remplir au moins un des champs spécifiés
          if (fields.length > 0) {
            const randomField = fields[Math.floor(Math.random() * fields.length)];
            const field = formConfig.fields.find(f => f.id === randomField);
            if (field) {
              inputs[randomField] = generateValidInput(field);
            }
          }
          break;

        default:
          cy.log(`Condition type "${conditionType}" non gérée.`);
          break;
      }

      // Appliquer les inputs si nécessaire
      if (Object.keys(inputs).length > 0) {
        applyInputs(inputs);
      }

      // Vérifier que les boutons sont dans leur état par défaut
      formConfig.actions.forEach(action => {
        const testId = action['data-testid'];
        const defaultState = action.defaultState;

        if (defaultState === 'enable') {
          cy.get(`[data-testid="${testId}"]`).should('not.be.disabled');
        } else if (defaultState === 'disable') {
          cy.get(`[data-testid="${testId}"]`).should('be.disabled');
        } else if (defaultState === 'enabled') {
          cy.get(`[data-testid="${testId}"]`).should('not.be.disabled');
        }
      });
    });

  });

});
