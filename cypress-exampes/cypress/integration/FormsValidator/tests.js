import RandExp from 'randexp'
import {forms} from '../../fixtures/forms.json';

const generateValidInput = (field) => {
  if (field.regex) {
    const reff=new RandExp(field.regex).gen();
    cy.log("regx generated "+reff)
    return reff;
  } else if (field.type === "number") {
    return Math.floor((field.min || 18) + Math.random() * ((field.max || 100) - (field.min || 18)));
  } else if (field.type === "select") {
    return field.options[0];
  } else if (field.type === "date") {
    return field.options[0];
  }
  return "valid";
};

const generateInvalidInput = (field) => {
  if (field.regex) {
    return "InvalidValue";
  } else if (field.type === "number") {
    return field.min ? field.min - 1 : -1;
  } else if (field.type === "select") {
    return "";
  }
  return "";
};

  for (let { formName,formLink, fields, buttons } of forms) {
    describe(`Dynamic Form ${formName} Tests `, () => {
        fields.forEach((field) => {
          it(`[${formName}] Should activate "Reset" button when "${field.id}" is modified`, () => {
            cy.visit(formLink);
            cy.get("#resetButton").should("be.disabled");

            // Modify the field
            if (field.type === "input" || field.type === "email" || field.type === "password") {
              cy.get(`#${field.id}`).type(generateValidInput(field));
            } else if (field.type === "number") {
              cy.get(`#${field.id}`).clear().type(generateValidInput(field).toString()).blur().clear().type(generateValidInput(field).toString());
            } else if (field.type === "select") {
              cy.get(`#${field.id}`).select(generateValidInput(field).toString());
            } else if (field.type === "date") {
              cy.get(`#${field.id}`).clear().type(generateValidInput(field).toString()).blur().clear().type(generateValidInput(field).toString());
            }

            // Check Reset button is enabled
            cy.get("#resetButton").should("not.be.disabled");
          });
        });
  });
  }