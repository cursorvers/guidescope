/**
 * SettingsUI Tab Component
 * UI/UX settings: theme, font size, default tabs, UI options
 */

import {
  Palette,
  Type,
  Layout,
  Sliders,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { UISettings } from '@/lib/settings';
import { SettingsCard, SettingsRow } from './components';
import type { SettingsUIProps } from './types';

export function SettingsUI({
  extendedSettings,
  updateUI,
  allPresets,
}: SettingsUIProps) {
  return (
    <div className="space-y-6">
      <SettingsCard
        icon={Palette}
        title="テーマ"
        description="アプリの外観テーマを設定します"
      >
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: 'ライト', icon: Sun },
            { value: 'dark', label: 'ダーク', icon: Moon },
            { value: 'system', label: 'システム', icon: Monitor },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => updateUI({ theme: value as UISettings['theme'] })}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                extendedSettings.ui.theme === value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <Icon className={cn(
                'w-6 h-6',
                extendedSettings.ui.theme === value ? 'text-primary' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'text-sm font-medium',
                extendedSettings.ui.theme === value ? 'text-primary' : 'text-muted-foreground'
              )}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        icon={Type}
        title="フォントサイズ"
        description="テキストの表示サイズを調整します"
      >
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'small', label: '小', sample: 'Aa' },
            { value: 'medium', label: '中', sample: 'Aa' },
            { value: 'large', label: '大', sample: 'Aa' },
          ].map(({ value, label, sample }) => (
            <button
              key={value}
              onClick={() => updateUI({ fontSize: value as UISettings['fontSize'] })}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                extendedSettings.ui.fontSize === value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <span className={cn(
                'font-bold',
                value === 'small' && 'text-sm',
                value === 'medium' && 'text-base',
                value === 'large' && 'text-2xl',
                extendedSettings.ui.fontSize === value ? 'text-primary' : 'text-muted-foreground'
              )}>
                {sample}
              </span>
              <span className={cn(
                'text-sm font-medium',
                extendedSettings.ui.fontSize === value ? 'text-primary' : 'text-muted-foreground'
              )}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        icon={Layout}
        title="デフォルトタブ"
        description="アプリ起動時に開くタブを設定します"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>デフォルト目的タブ</Label>
            <Select
              value={extendedSettings.ui.defaultPurposeTab}
              onValueChange={(value) => updateUI({ defaultPurposeTab: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allPresets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>デフォルト出力タブ</Label>
            <Select
              value={extendedSettings.ui.defaultOutputTab}
              onValueChange={(value: UISettings['defaultOutputTab']) =>
                updateUI({ defaultOutputTab: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prompt">Gemini貼り付け用プロンプト</SelectItem>
                <SelectItem value="queries">検索クエリ一覧</SelectItem>
                <SelectItem value="json">設定JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={Sliders}
        title="UI オプション"
        description="その他のUI設定"
      >
        <div className="space-y-4">
          <SettingsRow
            label="コンパクトモード"
            description="UIの余白を減らしてコンパクトに表示"
          >
            <Switch
              checked={extendedSettings.ui.compactMode}
              onCheckedChange={(checked) => updateUI({ compactMode: checked })}
            />
          </SettingsRow>

          <SettingsRow
            label="ツールチップを表示"
            description="ホバー時にヘルプテキストを表示"
          >
            <Switch
              checked={extendedSettings.ui.showTooltips}
              onCheckedChange={(checked) => updateUI({ showTooltips: checked })}
            />
          </SettingsRow>

          <SettingsRow
            label="アニメーションを有効化"
            description="UIのトランジションとアニメーション"
          >
            <Switch
              checked={extendedSettings.ui.animationsEnabled}
              onCheckedChange={(checked) => updateUI({ animationsEnabled: checked })}
            />
          </SettingsRow>
        </div>
      </SettingsCard>
    </div>
  );
}
