import './commands';
import 'cypress-mochawesome-reporter/register';
import addContext from 'mochawesome/addContext';

const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/; //NOSONAR

Cypress.on('window:before:load', (window) => {
  Object.defineProperty(window.navigator, 'language', { value: 'en-EN' });
  Object.defineProperty(window.navigator, 'languages', { value: ['en-EN'] });
});

Cypress.on('test:after:run', (test, _runnable) => {
  if (test.state === 'failed') {
    addContext({ test }, 'test');
  }
});

Cypress.on('uncaught:exception', (err) => {
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false;
  }
});
