/* eslint-disable react-refresh/only-export-components -- context + hook colocated for small UI shell */
import { createContext, useContext, type ReactElement, type ReactNode } from 'react';

interface UiContextValue {
  readonly density: 'comfortable' | 'compact';
}

const UiContext = createContext<UiContextValue>({ density: 'comfortable' });

export function UiProvider({ children }: { readonly children: ReactNode }): ReactElement {
  return <UiContext.Provider value={{ density: 'comfortable' }}>{children}</UiContext.Provider>;
}

export function useUi(): UiContextValue {
  return useContext(UiContext);
}
