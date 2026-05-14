import { AppContainer } from './app-container.js';
import { registerDefaultProviders } from './register-default-providers.js';

/**
 * Composition root: único ponto de entrada para o grafo de dependências em runtime.
 */
export function createCompositionRoot(): AppContainer {
  const container = new AppContainer();
  registerDefaultProviders(container);
  return container;
}
