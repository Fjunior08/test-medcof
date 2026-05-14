import type { DiKey, DiRegistry } from './di-registry.js';

type SingletonFactory<K extends DiKey> = (container: AppContainer) => DiRegistry[K];

/**
 * Container leve, sem reflexão: registro explícito + singleton lazy.
 * Substitua providers em testes de integração montando outro `AppContainer` com os mesmos keys.
 */
export class AppContainer {
  private readonly singletons: Partial<DiRegistry> = {};
  private readonly factories = new Map<DiKey, SingletonFactory<DiKey>>();

  registerSingleton<K extends DiKey>(key: K, factory: SingletonFactory<K>): void {
    this.factories.set(key, factory as SingletonFactory<DiKey>);
  }

  resolve<K extends DiKey>(key: K): DiRegistry[K] {
    const cached = this.singletons[key];
    if (cached !== undefined) {
      return cached;
    }
    const factory = this.factories.get(key);
    if (factory === undefined) {
      throw new Error(`DI: no provider registered for "${key}"`);
    }
    const instance = factory(this) as DiRegistry[K];
    this.singletons[key] = instance;
    return instance;
  }
}
