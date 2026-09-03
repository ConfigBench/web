import { ToastContainer, type ToastItem } from '../../../shared/components/ui/ToastContainer';

export type { ToastItem };

interface StatusToastsProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

export function StatusToasts({ toasts, onDismiss }: StatusToastsProps) {
  return <ToastContainer toasts={toasts} onDismiss={onDismiss} />;
}
