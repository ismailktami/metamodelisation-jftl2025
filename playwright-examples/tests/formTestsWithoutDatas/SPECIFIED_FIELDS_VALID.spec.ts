// Ce fichier génère dynamiquement des tests Playwright à partir d'un métamodèle JSON.
// Pour chaque configuration de formulaire, il parcourt les règles de type 'SPECIFIED_FIELDS_VALID'.
// Pour chaque valeur de règle, il crée un test où un champ spécifique prend une valeur donnée,
// tandis que les autres champs reçoivent des valeurs valides générées automatiquement.
// Les actions (boutons, etc.) sont ensuite vérifiées selon l'état attendu défini dans la règle.
// L'objectif est de valider le comportement dynamique du formulaire selon le modèle JSON.

import { test, expect } from '@playwright/test';
import { Util } from './util.js';
// Chargement de toutes les configurations de formulaires à partir des fichiers JSON du dossier 'datas'
const formConfigs = Util.loadJsonFiles('datas');

formConfigs.forEach(formConfig => {
  // Filtrage des règles pour ne garder que celles de type 'SPECIFIED_FIELDS_VALID'
  for (const rule of formConfig.rules.filter(rule => rule.conditionType === 'SPECIFIED_FIELDS_VALID')) {
    for (const item of rule.values) {
      // Génère dynamiquement le titre du test en fonction des actions attendues
      const actionsTitle = rule.actionStates.map(a => `${a.alias.toUpperCase()} should be ${a.state.replace('toBe', '').toLowerCase()}`).join(', ');
      for (const [key, value] of Object.entries(item)) {
        test(`[${formConfig.formName}][SPECIFIED_FIELDS_VALID ${key.toUpperCase()}] ${actionsTitle}`, async ({ page }) => {
          await page.goto(formConfig.formLink);
          let inputs = {};
          // Génère les valeurs à saisir : la valeur de la règle pour le champ ciblé, valeurs valides pour les autres
          for (const field of formConfig.fields) {
            inputs[field.id] = field.id === key ? value : Util.generateValidInput(field);
          }
          // Applique toutes les valeurs générées sur le formulaire cible
          await Util.applyInputs(page, inputs);
          // Pour chaque action à vérifier (bouton, etc.), on vérifie l'état attendu (enabled, disabled, etc.)
          for (const actionState of rule.actionStates) {
            const action = formConfig.actions.find(action => action.alias === actionState.alias); // Associe l'alias à l'action réelle
            await expect(page.locator(`#${action['id']}`))[actionState.state]
          }
        });
      }
    }
  }
});
