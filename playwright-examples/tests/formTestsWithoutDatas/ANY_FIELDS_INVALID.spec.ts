// Ce fichier génère dynamiquement des tests Playwright à partir d'un métamodèle JSON.
// Pour chaque configuration, il teste le cas où un champ est invalide et les autres valides.
// Les actions (boutons, etc.) sont vérifiées selon l'état attendu défini dans la règle.
import { test, expect } from '@playwright/test';
import { Util } from './util.js';
// Chargement de toutes les configurations de formulaires à partir des fichiers JSON du dossier 'datas'
const formConfigs = Util.loadJsonFiles('datas');

formConfigs.forEach(form=>{
  // Filtrage des règles pour ne garder que celles de type 'ANY_FIELD_INVALID'
  for (const rule of form.rules.filter(rule => rule.conditionType === 'ANY_FIELD_INVALID')) {
    for (const invalidFieldId of rule.fields) {
      // Génère dynamiquement le titre du test en fonction des actions attendues
      const actionsTitle = rule.actionStates.map(a => `${a.alias.toUpperCase()} should be ${a.state.replace('toBe', '').toLowerCase()}`).join(', ');

      test(`[${form.formName}][${form.formName}][INVALID ${invalidFieldId.toUpperCase()}] ${actionsTitle}`, async ({ page }) => {
        await page.goto(form.formLink);
        let inputs = {};
        // Remplit le champ ciblé avec une valeur invalide, les autres avec des valeurs valides
        for (const field of form.fields) {
          inputs[field.id] = field.id === invalidFieldId ? Util.generateInvalidInput(field) : Util.generateValidInput(field);
        }
        await Util.applyInputs(page, inputs);
        // Vérifie l'état attendu pour chaque action (bouton, etc.)
        for (const actionState of rule.actionStates) {
          const action = form.actions.find(action => action.alias === actionState.alias);
          await expect(page.locator(`#${action['id']}`))[actionState.state]
        }
      });
    }
  }
})
