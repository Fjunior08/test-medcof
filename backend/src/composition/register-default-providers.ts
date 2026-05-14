import type { AppContainer } from './app-container.js';
import { registerApplicationProviders } from './providers/application.providers.js';
import { registerHttpProviders } from './providers/http.providers.js';
import { registerInfrastructureProviders } from './providers/infrastructure.providers.js';

/**
 * Registro centralizado da aplicação padrão (produção / dev local).
 * Para testes de integração, crie um `AppContainer` e substitua providers antes do primeiro `resolve`.
 */
export function registerDefaultProviders(container: AppContainer): void {
  registerInfrastructureProviders(container);
  registerApplicationProviders(container);
  registerHttpProviders(container);
}
