import { GRADIENT_TYPES } from '../engine/gradients';
import { useRgbStore } from '../components/rgbContexts';
import { cn } from '../../../shared/lib/cn';
import RgbPreview from './RgbPreview';

export default function AllGradientsPreview({ showSelection }: { showSelection?: boolean }) {
  const { store } = useRgbStore();
  return (
    <div className="flex flex-col gap-2">
      {GRADIENT_TYPES.map((type) => (
        <div key={type} className="flex items-center gap-2">
          <span
            className={cn(
              'min-w-16 rounded border px-1 py-1 text-center text-[10px]',
              store.gradientType === type
                ? 'border-white/20 bg-night/80 text-text'
                : 'border-white/10 text-dim',
            )}
          >
            {type}
          </span>
          <span className="flex-1">
            <RgbPreview
              showSelection={showSelection}
              override={{
                text: store.text,
                colors: store.colors,
                shadowColors: store.shadowColors,
                colorLength: store.colorLength,
                gradientType: type,
                formatting: store.formatting,
                baseFormatting: store.baseFormatting,
              }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}
