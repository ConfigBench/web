import { useContext } from 'react';
import { Eye } from 'lucide-react';
import { cn } from '../../../shared/lib/cn';
import { ShowAllGradientsContext } from './rgbContexts';

export default function ShowAllGradientsButton() {
  const { value: show, set } = useContext(ShowAllGradientsContext);
  return (
    <button
      type="button"
      onClick={() => set(!show)}
      title={show ? 'Show only selected gradient' : 'Show all gradients'}
      className={cn(
        'mc-icon-btn h-9 w-9 rounded-none p-0',
        show ? 'text-[var(--accent)]' : 'text-muted hover:text-text',
      )}
    >
      <Eye size={17} />
    </button>
  );
}
