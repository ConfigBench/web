import { Compass, Info, Repeat } from 'lucide-react';
import type { DualCoordinateResult } from '../types';

interface PortalLinkingCardProps {
  result: DualCoordinateResult;
}

export function PortalLinkingCard({ result }: PortalLinkingCardProps) {
  const { overworld, nether, portalLinking } = result;

  return (
    <div className="flex flex-col gap-3 rounded-none border border-line bg-[#15151f] p-4">
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <Repeat size={16} className="text-[var(--accent)]" />
          <span className="font-mc text-sm text-text">Nether Portal Linking Dynamics</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-muted">
          <span>Scale:</span>
          <span className="font-semibold text-text">1 Nether block = 8 Overworld blocks</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 rounded-none border border-line/60 bg-[#101018] p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#10b981]">
              Overworld Target & Search Box
            </span>
            <span className="font-mono text-[10px] text-muted">Radius 128</span>
          </div>
          <div className="font-mono text-xs text-text">
            <span>Target: </span>
            <strong className="text-text font-bold">
              X: {overworld.block.x}, Y: {overworld.block.y}, Z: {overworld.block.z}
            </strong>
          </div>
          <div className="font-mono text-[11px] text-muted">
            Search Area: X [{portalLinking.overworldSearchBox.minX} .. {portalLinking.overworldSearchBox.maxX}], Z [{portalLinking.overworldSearchBox.minZ} .. {portalLinking.overworldSearchBox.maxZ}]
          </div>
        </div>

        <div className="flex flex-col gap-1.5 rounded-none border border-line/60 bg-[#101018] p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#ef4444]">
              Nether Target & Search Box
            </span>
            <span className="font-mono text-[10px] text-muted">Radius 128</span>
          </div>
          <div className="font-mono text-xs text-text">
            <span>Target: </span>
            <strong className="text-text font-bold">
              X: {nether.block.x}, Y: {nether.block.y}, Z: {nether.block.z}
            </strong>
          </div>
          <div className="font-mono text-[11px] text-muted">
            Search Area: X [{portalLinking.netherSearchBox.minX} .. {portalLinking.netherSearchBox.maxX}], Z [{portalLinking.netherSearchBox.minZ} .. {portalLinking.netherSearchBox.maxZ}]
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-none border border-line/40 bg-[#0c0c14] p-2.5">
        <Info size={15} className="text-muted shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5 text-[11px] text-[#a6adc8] leading-relaxed">
          <span>
            <strong>Exact 1:1 Portal Pairing:</strong> To prevent Nether portals from pairing with unwanted nearby portals, build a portal at the exact Nether coordinates ({nether.block.x}, {nether.block.y}, {nether.block.z}) matching your Overworld portal.
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted pt-0.5">
            <Compass size={11} />
            Keep Nether portals below Y=120 to avoid spawning on the bedrock ceiling.
          </span>
        </div>
      </div>
    </div>
  );
}
