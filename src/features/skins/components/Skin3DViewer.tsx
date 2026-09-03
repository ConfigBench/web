import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Compass,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Tag,
} from 'lucide-react';
import {
  FlyingAnimation,
  IdleAnimation,
  RunningAnimation,
  SkinViewer,
  WalkingAnimation,
} from 'skinview3d';
import type { ModelType } from 'skinview-utils';
import { buildRenderUrl } from '../engine/urlBuilder';
import { cn } from '../../../shared/lib/cn';

type AnimationMode = 'static' | 'walk' | 'run' | 'fly' | 'idle' | 'rotate';
type CameraAngle = 'front' | 'back' | 'head';

interface Skin3DViewerProps {
  target: string;
}

export function Skin3DViewer({ target }: Skin3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<SkinViewer | null>(null);

  const [model, setModel] = useState<ModelType>('default');
  const [animation, setAnimation] = useState<AnimationMode>('walk');
  const [showOverlay, setShowOverlay] = useState(true);
  const [showNameTag, setShowNameTag] = useState(true);
  const [activeAngle, setActiveAngle] = useState<CameraAngle>('front');

  const textureUrl = buildRenderUrl('skin', target);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const initialWidth = container.clientWidth || 360;
    const initialHeight = Math.max(380, container.clientHeight || 420);

    const viewer = new SkinViewer({
      canvas,
      width: initialWidth,
      height: initialHeight,
      skin: textureUrl,
      model,
    });

    viewer.controls.enableRotate = true;
    viewer.controls.enableZoom = true;
    viewer.controls.enablePan = false;

    viewer.animation = new WalkingAnimation();
    viewer.nameTag = showNameTag ? target : null;

    viewerRef.current = viewer;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && viewerRef.current) {
        const w = Math.round(entry.contentRect.width);
        const h = Math.max(360, Math.round(entry.contentRect.height));
        viewerRef.current.width = w;
        viewerRef.current.height = h;
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      viewer.dispose();
      viewerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.loadSkin(textureUrl, { model });
    viewer.nameTag = showNameTag ? target : null;
  }, [textureUrl, model, target, showNameTag]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.autoRotate = animation === 'rotate';

    switch (animation) {
      case 'walk':
        viewer.animation = new WalkingAnimation();
        break;
      case 'run':
        viewer.animation = new RunningAnimation();
        break;
      case 'fly':
        viewer.animation = new FlyingAnimation();
        break;
      case 'idle':
        viewer.animation = new IdleAnimation();
        break;
      case 'rotate':
        viewer.animation = null;
        break;
      case 'static':
        viewer.animation = null;
        viewer.playerObject.rotation.set(0, 0, 0);
        viewer.playerObject.skin.head.rotation.set(0, 0, 0);
        viewer.playerObject.skin.leftArm.rotation.set(0, 0, 0);
        viewer.playerObject.skin.rightArm.rotation.set(0, 0, 0);
        viewer.playerObject.skin.leftLeg.rotation.set(0, 0, 0);
        viewer.playerObject.skin.rightLeg.rotation.set(0, 0, 0);
        break;
    }
  }, [animation]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const skin = viewer.playerObject.skin;
    skin.head.outerLayer.visible = showOverlay;
    skin.body.outerLayer.visible = showOverlay;
    skin.leftArm.outerLayer.visible = showOverlay;
    skin.rightArm.outerLayer.visible = showOverlay;
    skin.leftLeg.outerLayer.visible = showOverlay;
    skin.rightLeg.outerLayer.visible = showOverlay;
  }, [showOverlay]);

  const applyCameraAngle = (angle: CameraAngle) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    setActiveAngle(angle);

    viewer.playerObject.rotation.set(0, 0, 0);

    if (angle === 'front') {
      viewer.camera.position.set(0, 0, 42);
      viewer.controls.target.set(0, 0, 0);
    } else if (angle === 'back') {
      viewer.camera.position.set(0, 0, -42);
      viewer.controls.target.set(0, 0, 0);
    } else if (angle === 'head') {
      viewer.camera.position.set(0, 10, 24);
      viewer.controls.target.set(0, 10, 0);
    }
    viewer.controls.update();
  };

  const handleResetPose = () => {
    applyCameraAngle('front');
    setAnimation('walk');
  };

  return (
    <div className="flex flex-col justify-between rounded-none border border-line bg-[#15151f] p-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[var(--accent)]" />
          <span className="font-mc text-sm text-[#cdd6f4]">Interactive 3D Character Model</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative my-3 flex min-h-[380px] w-full flex-1 items-center justify-center overflow-hidden rounded-none border border-line/60 bg-[#090910]"
      >
        <canvas ref={canvasRef} className="h-full w-full touch-none cursor-grab active:cursor-grabbing" />

        <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1.5 font-mono text-[10px] text-[#6c7086]">
          <Compass size={11} />
          <span>Drag to rotate · Scroll to zoom</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-line/60 pt-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 flex items-center gap-1 text-[11px] uppercase text-[#6c7086]">
              <Camera size={11} />
              Angle:
            </span>
            {(['front', 'back', 'head'] as const).map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => applyCameraAngle(angle)}
                data-active={activeAngle === angle}
                className={cn(
                  'mc-btn px-2 py-1 capitalize text-[#a6adc8] hover:text-[#cdd6f4]',
                  activeAngle === angle && '!border-[var(--accent)] !text-[var(--accent)]',
                )}
              >
                {angle}
              </button>
            ))}
            <button
              type="button"
              onClick={handleResetPose}
              className="mc-icon-btn h-7 w-7 rounded-none p-0 text-[#6c7086] hover:text-[#cdd6f4]"
              title="Reset angle & walk animation"
            >
              <RotateCcw size={12} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <span className="mr-1 text-[11px] uppercase text-[#6c7086]">Arms:</span>
            <button
              type="button"
              onClick={() => setModel('default')}
              data-active={model === 'default'}
              className={cn(
                'mc-btn px-2 py-1 text-[11px] text-[#a6adc8] hover:text-[#cdd6f4]',
                model === 'default' && '!border-[var(--accent)] !text-[var(--accent)]',
              )}
            >
              Classic (4px)
            </button>
            <button
              type="button"
              onClick={() => setModel('slim')}
              data-active={model === 'slim'}
              className={cn(
                'mc-btn px-2 py-1 text-[11px] text-[#a6adc8] hover:text-[#cdd6f4]',
                model === 'slim' && '!border-[var(--accent)] !text-[var(--accent)]',
              )}
            >
              Slim (3px)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/40 pt-2">
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 flex items-center gap-1 text-[11px] uppercase text-[#6c7086]">
              <Play size={11} />
              Pose:
            </span>
            {[
              { key: 'walk', label: 'Walking' },
              { key: 'run', label: 'Running' },
              { key: 'fly', label: 'Flying' },
              { key: 'idle', label: 'Idle' },
              { key: 'rotate', label: 'Rotating' },
              { key: 'static', label: 'Static' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setAnimation(key as AnimationMode)}
                data-active={animation === key}
                className={cn(
                  'mc-btn px-2 py-1 text-[11px] text-[#a6adc8] hover:text-[#cdd6f4]',
                  animation === key && '!border-[var(--accent)] !text-[var(--accent)]',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOverlay((v) => !v)}
              data-active={showOverlay}
              className={cn(
                'mc-btn flex items-center gap-1 rounded-none px-2 py-1 text-[11px] text-[#a6adc8] hover:text-[#cdd6f4]',
                showOverlay && '!border-[var(--accent)] !text-[var(--accent)]',
              )}
            >
              <Layers size={11} />
              <span>2nd Layer</span>
            </button>

            <button
              type="button"
              onClick={() => setShowNameTag((v) => !v)}
              data-active={showNameTag}
              className={cn(
                'mc-btn flex items-center gap-1 rounded-none px-2 py-1 text-[11px] text-[#a6adc8] hover:text-[#cdd6f4]',
                showNameTag && '!border-[var(--accent)] !text-[var(--accent)]',
              )}
            >
              <Tag size={11} />
              <span>Name Tag</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
