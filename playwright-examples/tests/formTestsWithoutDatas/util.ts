import RandExp from 'randexp';
import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export class Util {

  static loadJsonFiles(directory) {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const fullPath = join(__dirname, directory);
  
    try {
      return readdirSync(fullPath)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = join(fullPath, file);
          const rawData = readFileSync(filePath, 'utf-8');
          return JSON.parse(rawData);
        });
    } catch (error) {
      throw new Error(`Erreur de chargement des JSON depuis ${directory}: ${error instanceof Error ? error.message : error}`);
    }
  }

  static generateValidInput(field) {
    if (field.type === 'select') {
      if (field.options?.length > 0) {
        return this._getRandomOption(field.options);
      }
      return null;
    }

    if (field.type === 'number') {
      return this._generateNumber(field);
    }
    if (field.type === 'date') {
      return this._generateDate(field);
    }

    if (field.regex) {
      return new RandExp(field.regex).gen();
    }

    // Fallback pour les autres types
    switch(field.type) {
      case 'email':
        return 'valid@example.com';
      case 'password':
        return 'ValidPassword123!';
      default:
        return 'ValidValue';
    }
  }

  static generateInvalidInput(field) {
    switch(field.type) {
      case 'number':
        return '-999';
      case 'email':
        return 'invalidemail';
      case 'password':
        return 'weak';
      case 'select':
        return null;
      default:
        return field.id === 'username' 
          ? 'invalidUsername' 
          : 'InvalidValue412@';
    }
  }

  static async applyInputs(page, inputs) {
    for (const [fieldId, value] of Object.entries(inputs)) {
      if (!value) continue;

      const element = page.locator(`#${fieldId}`);
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());

      if (tagName === 'select') {
        await element.selectOption(value.toString());
      } else {
        await element.fill(value.toString());
      }
    }
  }

  // Helpers privés
  static _generateNumber(field) {
    if (field.min !== undefined && field.max !== undefined) {
      return Math.floor(Math.random() * (field.max - field.min + 1)) + field.min;
    }
    return Math.floor(Math.random() * 1000);
  }

  // Helpers privés // generate date with min and max
  static _generateDate(field) {
    if (field.min && field.max) {
      const minDate = new Date(field.min);
      const maxDate = new Date(field.max);
      const randomTime = Math.random() * (maxDate.getTime() - minDate.getTime()) + minDate.getTime();
      return new Date(randomTime).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0]; // Default to today
  }

  static _getRandomOption(options) {
    return options[Math.floor(Math.random() * options.length)];
  }
}