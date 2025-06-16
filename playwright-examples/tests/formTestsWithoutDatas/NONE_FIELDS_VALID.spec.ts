// Ce fichier génère dynamiquement des tests Playwright à partir d'un métamodèle JSON.
// Pour chaque configuration, il teste le cas où aucun champ n'est valide (tous invalides).
// Les actions (boutons, etc.) sont vérifiées selon l'état attendu défini dans la règle.
import { test, expect } from '@playwright/test';
import { Util } from './util.js';
// Chargement de toutes les configurations de formulaires à partir des fichiers JSON du dossier 'datas'
const formConfigs = Util.loadJsonFiles('datas');

formConfigs.forEach(formConfig => {
  // Filtrage des règles pour ne garder que celles de type 'NONE_FIELDS_VALID'
  for (const rule of formConfig.rules.filter(rule => rule.conditionType === 'NONE_FIELDS_VALID')) {
    // Génère dynamiquement le titre du test en fonction des actions attendues
    const actionsTitle = rule.actionStates.map(a => `${a.alias.toUpperCase()} should be ${a.state.replace('toBe', '').toLowerCase()}`).join(', ');
    test(`[${formConfig.formName}][NONE_FIELDS_VALID] ${actionsTitle}`, async ({ page }) => {
      await page.goto(formConfig.formLink);
      let inputs = {};
      // Remplit tous les champs avec des valeurs invalides générées automatiquement
      for (const field of formConfig.fields) {
        inputs[field.id] = Util.generateInvalidInput(field);
      }
      await Util.applyInputs(page, inputs);
      // Vérifie l'état attendu pour chaque action (bouton, etc.)
      for (const actionState of rule.actionStates) {
        const action = formConfig.actions.find(action => action.alias === actionState.alias);
        await expect(page.locator(`#${action['id']}`))[actionState.state];
      }
    });

  }
});
