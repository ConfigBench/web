import { ToastContainer, type ToastItem } from '../../../shared/components/ui/ToastContainer';

export type { ToastItem };

interface CoordToastsProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

export function CoordToasts({ toasts, onDismiss }: CoordToastsProps) {
  return <ToastContainer toasts={toasts} onDismiss={onDismiss} />;
}
