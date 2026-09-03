import { ToastContainer } from '../../../shared/components/ui/ToastContainer';
import { useRgbStore } from './rgbContexts';

export function Toasts() {
  const { toasts, dismissToast } = useRgbStore();
  return <ToastContainer toasts={toasts} onDismiss={dismissToast} />;
}
