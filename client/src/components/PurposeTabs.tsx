/**
 * Medical AI Prompt Builder - Purpose Tabs Component (Desktop)
 * Design: Medical Precision 2.0 - Heavy yet Light
 * 
 * Features:
 * - Premium tab design with icons
 * - Smooth transitions and hover effects
 * - Visual indicator for active state
 */

import { TAB_PRESETS } from '@/lib/presets';
import { cn } from '@/lib/utils';
import { 
  Cpu, 
  Stethoscope, 
  BookOpen, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface PurposeTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TAB_ICONS: Record<string, React.ReactNode> = {
  'medical-device': <Cpu className="w-4 h-4" />,
  'clinical-operation': <Stethoscope className="w-4 h-4" />,
  'research-ethics': <BookOpen className="w-4 h-4" />,
  'generative-ai': <Sparkles className="w-4 h-4" />,
};

const TAB_DESCRIPTIONS: Record<string, string> = {
  'medical-device': 'SaMD・AI医療機器の開発・申請',
  'clinical-operation': '医療機関でのAI導入・運用',
  'research-ethics': '臨床研究・倫理審査対応',
  'generative-ai': '生成AI活用・ガバナンス',
};

export function PurposeTabs({ activeTab, onTabChange }: PurposeTabsProps) {
  return (
    <div className="hidden lg:block bg-card border-b border-border">
      <div className="container">
        <div className="flex items-center gap-1 py-2">
          <span className="text-xs font-medium text-muted-foreground mr-3 uppercase tracking-wider">
            目的
          </span>
          {TAB_PRESETS.map((preset, index) => {
            const isActive = activeTab === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onTabChange(preset.id)}
                className={cn(
                  'group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium',
                  'transition-all duration-200 ease-out',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                )}
              >
                {/* Number badge */}
                <span className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold',
                  'transition-colors duration-200',
                  isActive
                    ? 'bg-white/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                )}>
                  {index + 1}
                </span>
                
                {/* Icon */}
                <span className={cn(
                  'transition-transform duration-200',
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                )}>
                  {TAB_ICONS[preset.id]}
                </span>
                
                {/* Text */}
                <div className="text-left">
                  <div className="font-semibold">{preset.name}</div>
                  <div className={cn(
                    'text-[10px] font-normal opacity-80 hidden xl:block',
                    isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}>
                    {TAB_DESCRIPTIONS[preset.id]}
                  </div>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
