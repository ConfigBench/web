import { useState, type ReactNode } from 'react';
import { SelectionContext, SelectionSetterContext, type Selection } from './rgbContexts';

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<Selection | undefined>();
  return (
    <SelectionContext.Provider value={selection}>
      <SelectionSetterContext.Provider value={setSelection}>{children}</SelectionSetterContext.Provider>
    </SelectionContext.Provider>
  );
}
