/**
 * Medical AI Prompt Builder - Home Page
 * Design: Medical Precision 2.0 - Heavy yet Light
 * 
 * Layout:
 * - PC: Fixed header + Purpose tabs + Two-pane (Settings 40% / Output 60%)
 * - Mobile: Compact header + Pill tabs + Bottom navigation + Swipeable panels
 * 
 * Features:
 * - Responsive design for all screen sizes
 * - Smooth transitions and animations
 * - Touch-optimized mobile experience
 */

import { useState, useEffect } from 'react';
import { 
  Settings, 
  FileOutput, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Header } from '@/components/Header';
import { MobileHeader } from '@/components/MobileHeader';
import { PurposeTabs } from '@/components/PurposeTabs';
import { MobilePurposeTabs } from '@/components/MobilePurposeTabs';
import { SettingsPanel } from '@/components/SettingsPanel';
import { OutputPanel } from '@/components/OutputPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useConfig } from '@/hooks/useConfig';
import { cn } from '@/lib/utils';

export default function Home() {
  const {
    config,
    validation,
    updateField,
    switchTab,
    toggleCategory,
    moveCategory,
    toggleKeywordChip,
    toggleScope,
    addCustomScope,
    toggleAudience,
    addPriorityDomain,
    removePriorityDomain,
    setCustomKeywords,
    setExcludeKeywords,
    resetConfig,
    importConfig,
  } = useConfig();
  
  // Mobile panel state
  const [mobilePanel, setMobilePanel] = useState<'settings' | 'output'>('settings');
  
  // Auto-switch to output when valid on mobile
  useEffect(() => {
    if (validation.isValid && config.query.trim() && mobilePanel === 'settings') {
      // Small delay for better UX
      const timer = setTimeout(() => {
        // Don't auto-switch, let user decide
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [validation.isValid, config.query, mobilePanel]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Desktop Header */}
      <Header />
      
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Desktop Purpose Tabs */}
      <PurposeTabs
        activeTab={config.activeTab}
        onTabChange={switchTab}
      />
      
      {/* Mobile Purpose Tabs */}
      <MobilePurposeTabs
        activeTab={config.activeTab}
        onTabChange={switchTab}
      />
      
      {/* Mobile Panel Switcher */}
      <div className="lg:hidden sticky top-[73px] z-40 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="flex">
          <button
            onClick={() => setMobilePanel('settings')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all',
              'active:scale-[0.98]',
              mobilePanel === 'settings'
                ? 'text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Settings className="w-4 h-4" />
            <span>設定</span>
            {mobilePanel === 'settings' && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <div className="w-px bg-border" />
          <button
            onClick={() => setMobilePanel('output')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all relative',
              'active:scale-[0.98]',
              mobilePanel === 'output'
                ? 'text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <FileOutput className="w-4 h-4" />
            <span>生成結果</span>
            {!validation.isValid && (
              <span className="absolute top-2 right-[30%] w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            )}
            {mobilePanel === 'output' && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane - Settings */}
        <aside
          className={cn(
            'lg:w-[420px] xl:w-[480px] 2xl:w-[520px] lg:border-r border-border bg-card',
            'lg:flex lg:flex-col lg:h-[calc(100vh-180px)] lg:sticky lg:top-[180px]',
            mobilePanel === 'settings' ? 'flex flex-col flex-1' : 'hidden'
          )}
        >
          <ScrollArea className="flex-1">
            <SettingsPanel
              config={config}
              validation={validation}
              onUpdateField={updateField}
              onToggleCategory={toggleCategory}
              onMoveCategory={moveCategory}
              onToggleKeywordChip={toggleKeywordChip}
              onToggleScope={toggleScope}
              onAddCustomScope={addCustomScope}
              onToggleAudience={toggleAudience}
              onAddPriorityDomain={addPriorityDomain}
              onRemovePriorityDomain={removePriorityDomain}
              onSetCustomKeywords={setCustomKeywords}
              onSetExcludeKeywords={setExcludeKeywords}
            />
          </ScrollArea>
          
          {/* Mobile: Generate Button */}
          <div className="lg:hidden p-4 border-t border-border bg-card/95 backdrop-blur-lg">
            <Button
              onClick={() => setMobilePanel('output')}
              disabled={!validation.isValid}
              className="w-full h-12 text-base font-semibold gap-2 shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              プロンプトを生成
              <ChevronRight className="w-5 h-5 ml-auto" />
            </Button>
          </div>
        </aside>
        
        {/* Right Pane - Output */}
        <section
          className={cn(
            'flex-1 flex flex-col bg-background lg:h-[calc(100vh-180px)] lg:sticky lg:top-[180px]',
            mobilePanel === 'output' ? 'flex' : 'hidden lg:flex'
          )}
        >
          <OutputPanel
            config={config}
            validation={validation}
            onImportConfig={importConfig}
            onResetConfig={resetConfig}
          />
        </section>
      </main>
      
      {/* Mobile FAB for quick switching */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          onClick={() => setMobilePanel(mobilePanel === 'settings' ? 'output' : 'settings')}
          className={cn(
            'rounded-full shadow-xl h-14 w-14 p-0',
            'transition-all duration-300 ease-out',
            'hover:scale-105 active:scale-95',
            mobilePanel === 'output' && 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
          )}
        >
          {mobilePanel === 'settings' ? (
            <FileOutput className="w-6 h-6" />
          ) : (
            <Settings className="w-6 h-6" />
          )}
        </Button>
      </div>
    </div>
  );
}
