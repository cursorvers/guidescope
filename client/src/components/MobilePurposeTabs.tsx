/**
 * Medical AI Prompt Builder - Mobile Purpose Tabs Component
 * Design: Medical Precision (Swiss Design × Medical Device UI)
 * 
 * Features:
 * - Compact pill-style tabs for mobile
 * - Horizontal scroll with snap
 * - Touch-optimized
 */

import { TAB_PRESETS } from '@/lib/presets';
import { cn } from '@/lib/utils';
import { 
  Cpu, 
  Stethoscope, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';

interface MobilePurposeTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TAB_ICONS: Record<string, React.ReactNode> = {
  'medical-device': <Cpu className="w-3.5 h-3.5" />,
  'clinical-operation': <Stethoscope className="w-3.5 h-3.5" />,
  'research-ethics': <BookOpen className="w-3.5 h-3.5" />,
  'generative-ai': <Sparkles className="w-3.5 h-3.5" />,
};

const TAB_SHORT_NAMES: Record<string, string> = {
  'medical-device': '機器開発',
  'clinical-operation': '臨床運用',
  'research-ethics': '研究倫理',
  'generative-ai': '生成AI',
};

export function MobilePurposeTabs({ activeTab, onTabChange }: MobilePurposeTabsProps) {
  return (
    <div className="bg-card border-b border-border lg:hidden">
      <div className="px-3 py-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory">
          {TAB_PRESETS.map((preset) => {
            const isActive = activeTab === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onTabChange(preset.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap snap-start',
                  'transition-all duration-150 active:scale-95',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-muted-foreground'
                )}
              >
                {TAB_ICONS[preset.id]}
                <span>{TAB_SHORT_NAMES[preset.id]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
