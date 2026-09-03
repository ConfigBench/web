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
        show ? 'text-[var(--accent)]' : 'text-[#a6adc8] hover:text-[#cdd6f4]',
      )}
    >
      <Eye size={17} />
    </button>
  );
}
