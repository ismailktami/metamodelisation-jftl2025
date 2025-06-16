// Ce fichier génère dynamiquement des tests Playwright à partir d'un métamodèle JSON.
// Pour chaque configuration, il teste le cas où tous les champs sont invalides.
// Les actions (boutons, etc.) sont vérifiées selon l'état attendu défini dans la règle.
import { test, expect } from '@playwright/test';
import { Util } from './util.js';
// Chargement de toutes les configurations de formulaires à partir des fichiers JSON du dossier 'datas'
const formConfigs = Util.loadJsonFiles('datas');

formConfigs.forEach(formConfig => {
  // Filtrage des règles pour ne garder que celles de type 'ALL_FIELDS_INVALID'
  for (const rule of formConfig.rules.filter(rule => rule.conditionType === 'ALL_FIELDS_INVALID')) {
    // Génère dynamiquement le titre du test en fonction des actions attendues
    const actionsTitle = rule.actionStates.map(a => `${a.alias.toUpperCase()} should be ${a.state.replace('toBe', '').toLowerCase()}`).join(', ');
    test(`[${formConfig.formName}][ALL_FIELDS_INVALID] ${actionsTitle}`, async ({ page }) => {
      await page.goto(formConfig.formLink);
      let inputs = {};
      // Remplit tous les champs avec des valeurs invalides générées automatiquement
      for (const field of formConfig.fields) {
        const generatedValue = Util.generateInvalidInput(field);
        if (generatedValue)
          inputs[field.id] = generatedValue;
      }
      await Util.applyInputs(page, inputs);
      // Vérifie l'état attendu pour chaque action (bouton, etc.)
      for (const actionState of rule.actionStates) {
        const action = formConfig.actions.find(action => action.alias === actionState.alias);
        await expect(page.locator(`#${action['id']}`))[actionState.state]
      }
    });
  }
});