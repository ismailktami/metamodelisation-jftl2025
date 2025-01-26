// generer dynamiquement
function generateValidInput(field) {
    switch (field.type) {
      case 'text':
      case 'input':
      case 'email':
      case 'password':
        return 'testValue';
      case 'number':
        return 42; // un nombre valide
      case 'date':
        return '2024-01-01';
      case 'select':
        // Prenons la première option non vide si dispo
        return field.options?.find(opt => opt !== '') || '';
      default:
        return 'dummyValue';
    }
  }
  
  // Script principal
  describe('Dynamic Forms Tests', () => {
  
    forms.forEach(({ formName, formLink, fields, buttons }) => {
      describe(`Form "${formName}"`, () => {
        
        fields.forEach((field) => {
          it(`[${formName}] Reset button should activate when "${field.id}" is modified`, () => {
            cy.visit(formLink);
            cy.get('#resetButton').should('be.disabled');
  
            // On modifie le champ en fonction de son type
            if (['text', 'input', 'email', 'password'].includes(field.type)) {
              cy.get(`#${field.id}`).type(generateValidInput(field));
            } else if (field.type === 'number') {
              cy.get(`#${field.id}`).clear().type(generateValidInput(field).toString());
            } else if (field.type === 'select') {
              cy.get(`#${field.id}`).select(generateValidInput(field).toString());
            } else if (field.type === 'date') {
              cy.get(`#${field.id}`).clear().type(generateValidInput(field).toString());
            }
  
            // Vérifie que le bouton reset n'est plus disabled
            cy.get('#resetButton').should('not.be.disabled');
          });
        });
        
        buttons.forEach((button) => {
          const { id: buttonId, rules = [] } = button;
  
          rules.forEach((rule) => {
            const { action, conditionType, fields: ruleFields = [] } = rule;
            const testName = `[${formName}] [${buttonId}] -> action: ${action}, condition: ${conditionType} (fields: ${ruleFields.join(', ')})`;
  
            it(testName, () => {
              cy.visit(formLink);
              if (button.initialState === 'disabled') {
                cy.get(`#${buttonId}`).should('be.disabled');
              } else if (button.initialState === 'enabled') {
                cy.get(`#${buttonId}`).should('not.be.disabled');
              }
  
              // On va “remplir” ou “modifier” les champs concernés selon conditionType
              // Ceci reste un exemple simplifié, à adapter à votre logique réelle.
              switch (conditionType) {
                case 'ANY_FILLED':
                  // Remplit le premier champ de la liste
                  if (ruleFields.length > 0) {
                    const firstFieldId = ruleFields[0];
                    const fieldMeta = fields.find(f => f.id === firstFieldId);
                    if (fieldMeta) {
                      if (['text','input','email','password'].includes(fieldMeta.type)) {
                        cy.get(`#${firstFieldId}`).type(generateValidInput(fieldMeta));
                      } else if (fieldMeta.type === 'number') {
                        cy.get(`#${firstFieldId}`).clear().type(generateValidInput(fieldMeta).toString());
                      } else if (fieldMeta.type === 'select') {
                        cy.get(`#${firstFieldId}`).select(generateValidInput(fieldMeta).toString());
                      } else if (fieldMeta.type === 'date') {
                        cy.get(`#${firstFieldId}`).clear().type(generateValidInput(fieldMeta).toString());
                      }
                    }
                  }
                  break;
                
                case 'ALL_FILLED':
                  // Remplit tous les champs de la liste
                  ruleFields.forEach((fieldId) => {
                    const fieldMeta = fields.find(f => f.id === fieldId);
                    if (!fieldMeta) return;
                    if (['text','input','email','password'].includes(fieldMeta.type)) {
                      cy.get(`#${fieldId}`).type(generateValidInput(fieldMeta));
                    } else if (fieldMeta.type === 'number') {
                      cy.get(`#${fieldId}`).clear().type(generateValidInput(fieldMeta).toString());
                    } else if (fieldMeta.type === 'select') {
                      cy.get(`#${fieldId}`).select(generateValidInput(fieldMeta).toString());
                    } else if (fieldMeta.type === 'date') {
                      cy.get(`#${fieldId}`).clear().type(generateValidInput(fieldMeta).toString());
                    }
                  });
                  break;
                
                case 'ANY_MODIFIED':
                  // On en modifie un seul
                  if (ruleFields.length > 0) {
                    const firstFieldId = ruleFields[0];
                    const fieldMeta = fields.find(f => f.id === firstFieldId);
                    if (fieldMeta) {
                      // Même logique que ANY_FILLED, mais on peut insister sur la notion "modifié"
                      cy.get(`#${firstFieldId}`).type(generateValidInput(fieldMeta));
                    }
                  }
                  break;
  
                // Vous pouvez faire de même pour NONE_FILLED, ALL_VALID, NONE_VALID, ALL_MODIFIED, etc.
                // ...
  
                default:
                  // Pour d’autres conditionTypes, on peut logguer un message ou étendre la logique
                  cy.log(`Condition type ${conditionType} non géré dans cet exemple.`);
                  break;
              }
              // Après avoir modifié/rampli, on vérifie que l’action attendue est effectivement réalisée
              // ex: if action === 'enable' => on s’attend à ce que le bouton ne soit plus disabled
              //    if action === 'disable' => on s’attend à ce que le bouton soit disabled
              //    if action === 'show' => on s’attend à ce que le bouton soit visible, etc.
              if (action === 'enable') {
                cy.get(`#${buttonId}`).should('not.be.disabled');
              } else if (action === 'disable') {
                cy.get(`#${buttonId}`).should('be.disabled');
              } else if (action === 'show') {
                cy.get(`#${buttonId}`).should('be.visible');
              } else if (action === 'hide') {
                cy.get(`#${buttonId}`).should('not.be.visible');
              } else {
                cy.log(`Action ${action} non gérée dans cet exemple.`);
              }
            });
          });
        });
      });
    });
  });
  
  