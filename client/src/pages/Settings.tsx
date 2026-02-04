/**
 * Medical AI Prompt Builder - Extended Settings Page
 * Design: Medical Precision 2.0
 * 
 * Features:
 * 1. プロンプトテンプレートのカスタマイズ
 *    - Role定義文の編集
 *    - 注意事項・免責事項の文言変更
 *    - 出力フォーマットのカスタマイズ
 * 2. 検索設定の詳細調整
 *    - 検索演算子のON/OFF
 *    - 検索結果の優先順位ルール
 *    - 除外ドメインの設定
 * 3. 出力設定
 *    - プロンプトの言語設定
 *    - 出力の詳細度
 *    - 法令クロスリファレンスのON/OFF
 * 4. UI/UX設定
 *    - ダークモード切り替え
 *    - フォントサイズ調整
 *    - デフォルトで開くタブの設定
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Layers,
  Globe,
  FileText,
  Database,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronRight,
  Download,
  Upload,
  AlertTriangle,
  Check,
  Sun,
  Moon,
  Monitor,
  Search,
  Type,
  Palette,
  Layout,
  Sliders,
  FileCode,
  Languages,
  Scale,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  TAB_PRESETS,
  DEFAULT_PRIORITY_DOMAINS,
  DEFAULT_SCOPE_OPTIONS,
  DEFAULT_AUDIENCE_OPTIONS,
  DISCLAIMER_LINES,
  TEMPLATE_BASE_DATE,
  type TabPreset,
} from '@/lib/presets';
import {
  type ExtendedSettings,
  type TemplateSettings,
  type SearchSettings,
  type OutputSettings,
  type UISettings,
  loadExtendedSettings,
  saveExtendedSettings,
  createDefaultExtendedSettings,
  DEFAULT_ROLE_TITLE,
  DEFAULT_ROLE_DESCRIPTION,
  DEFAULT_OUTPUT_SECTIONS,
  DEFAULT_TEMPLATE_SETTINGS,
  DEFAULT_SEARCH_SETTINGS,
  DEFAULT_OUTPUT_SETTINGS,
  DEFAULT_UI_SETTINGS,
} from '@/lib/settings';

// Storage keys for custom settings
const CUSTOM_PRESETS_KEY = 'medai_custom_presets_v1';
const CUSTOM_DOMAINS_KEY = 'medai_custom_domains_v1';
const CUSTOM_SCOPES_KEY = 'medai_custom_scopes_v1';
const CUSTOM_AUDIENCES_KEY = 'medai_custom_audiences_v1';

// Load custom data from localStorage
function loadCustomData<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
  }
  return defaultValue;
}

// Save custom data to localStorage
function saveCustomData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

// ============================================================================
// Settings Card Component
// ============================================================================

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('p-6 rounded-xl border border-border bg-card space-y-4', className)}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// ============================================================================
// Settings Row Component
// ============================================================================

function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex-1 min-w-0">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ============================================================================
// Main Settings Component
// ============================================================================

export default function Settings() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('template');
  
  // Extended settings state
  const [extendedSettings, setExtendedSettings] = useState<ExtendedSettings>(() => 
    loadExtendedSettings()
  );
  
  // Custom data states
  const [customPresets, setCustomPresets] = useState<TabPreset[]>(() => 
    loadCustomData(CUSTOM_PRESETS_KEY, [])
  );
  const [customDomains, setCustomDomains] = useState<string[]>(() => 
    loadCustomData(CUSTOM_DOMAINS_KEY, [])
  );
  const [customScopes, setCustomScopes] = useState<string[]>(() => 
    loadCustomData(CUSTOM_SCOPES_KEY, [])
  );
  const [customAudiences, setCustomAudiences] = useState<string[]>(() => 
    loadCustomData(CUSTOM_AUDIENCES_KEY, [])
  );
  
  // Dialog states
  const [editingPreset, setEditingPreset] = useState<TabPreset | null>(null);
  const [isNewPreset, setIsNewPreset] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  
  // Form states
  const [presetForm, setPresetForm] = useState({
    id: '',
    name: '',
    categories: '',
    keywordChips: '',
  });
  
  // New item input states
  const [newDomain, setNewDomain] = useState('');
  const [newExcludedDomain, setNewExcludedDomain] = useState('');
  const [newScope, setNewScope] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [newFiletype, setNewFiletype] = useState('');
  
  // Save extended settings when changed
  useEffect(() => {
    saveExtendedSettings(extendedSettings);
  }, [extendedSettings]);
  
  // Save custom data when changed
  useEffect(() => {
    saveCustomData(CUSTOM_PRESETS_KEY, customPresets);
  }, [customPresets]);
  
  useEffect(() => {
    saveCustomData(CUSTOM_DOMAINS_KEY, customDomains);
  }, [customDomains]);
  
  useEffect(() => {
    saveCustomData(CUSTOM_SCOPES_KEY, customScopes);
  }, [customScopes]);
  
  useEffect(() => {
    saveCustomData(CUSTOM_AUDIENCES_KEY, customAudiences);
  }, [customAudiences]);
  
  // Apply theme immediately
  useEffect(() => {
    const root = document.documentElement;
    const theme = extendedSettings.ui.theme;
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [extendedSettings.ui.theme]);
  
  // All presets (built-in + custom)
  const allPresets = [...TAB_PRESETS, ...customPresets];
  
  // All domains (default + custom)
  const allDomains = [...DEFAULT_PRIORITY_DOMAINS, ...customDomains];
  
  // All scopes (default + custom)
  const allScopes = [...DEFAULT_SCOPE_OPTIONS, ...customScopes];
  
  // All audiences (default + custom)
  const allAudiences = [...DEFAULT_AUDIENCE_OPTIONS, ...customAudiences];
  
  // Update helpers
  const updateTemplate = (updates: Partial<TemplateSettings>) => {
    setExtendedSettings(prev => ({
      ...prev,
      template: { ...prev.template, ...updates },
    }));
  };
  
  const updateSearch = (updates: Partial<SearchSettings>) => {
    setExtendedSettings(prev => ({
      ...prev,
      search: { ...prev.search, ...updates },
    }));
  };
  
  const updateOutput = (updates: Partial<OutputSettings>) => {
    setExtendedSettings(prev => ({
      ...prev,
      output: { ...prev.output, ...updates },
    }));
  };
  
  const updateUI = (updates: Partial<UISettings>) => {
    setExtendedSettings(prev => ({
      ...prev,
      ui: { ...prev.ui, ...updates },
    }));
  };
  
  // Preset editing handlers
  const handleEditPreset = (preset: TabPreset) => {
    setEditingPreset(preset);
    setIsNewPreset(false);
    setPresetForm({
      id: preset.id,
      name: preset.name,
      categories: preset.categories.join('\n'),
      keywordChips: preset.keywordChips.join('\n'),
    });
  };
  
  const handleNewPreset = () => {
    setEditingPreset({
      id: `custom-${Date.now()}`,
      name: '',
      categories: [],
      keywordChips: [],
    });
    setIsNewPreset(true);
    setPresetForm({
      id: `custom-${Date.now()}`,
      name: '',
      categories: '',
      keywordChips: '',
    });
  };
  
  const handleSavePreset = () => {
    if (!presetForm.name.trim()) {
      toast.error('プリセット名を入力してください');
      return;
    }
    
    const newPreset: TabPreset = {
      id: presetForm.id,
      name: presetForm.name.trim(),
      categories: presetForm.categories.split('\n').map(s => s.trim()).filter(Boolean),
      keywordChips: presetForm.keywordChips.split('\n').map(s => s.trim()).filter(Boolean),
    };
    
    if (isNewPreset) {
      setCustomPresets(prev => [...prev, newPreset]);
      toast.success('プリセットを追加しました');
    } else {
      const isCustom = customPresets.some(p => p.id === presetForm.id);
      if (isCustom) {
        setCustomPresets(prev => prev.map(p => p.id === presetForm.id ? newPreset : p));
        toast.success('プリセットを更新しました');
      } else {
        const customCopy = { ...newPreset, id: `custom-${Date.now()}` };
        setCustomPresets(prev => [...prev, customCopy]);
        toast.success('カスタムプリセットとして保存しました');
      }
    }
    
    setEditingPreset(null);
  };
  
  const handleDeletePreset = (presetId: string) => {
    setPresetToDelete(presetId);
    setDeleteConfirmOpen(true);
  };
  
  const confirmDeletePreset = () => {
    if (presetToDelete) {
      setCustomPresets(prev => prev.filter(p => p.id !== presetToDelete));
      toast.success('プリセットを削除しました');
    }
    setDeleteConfirmOpen(false);
    setPresetToDelete(null);
  };
  
  // Domain handlers
  const handleAddDomain = () => {
    const domain = newDomain.trim().toLowerCase();
    if (!domain) return;
    if (allDomains.includes(domain)) {
      toast.error('このドメインは既に登録されています');
      return;
    }
    setCustomDomains(prev => [...prev, domain]);
    setNewDomain('');
    toast.success('ドメインを追加しました');
  };
  
  const handleRemoveDomain = (domain: string) => {
    if (DEFAULT_PRIORITY_DOMAINS.includes(domain)) {
      toast.error('デフォルトドメインは削除できません');
      return;
    }
    setCustomDomains(prev => prev.filter(d => d !== domain));
    toast.success('ドメインを削除しました');
  };
  
  // Excluded domain handlers
  const handleAddExcludedDomain = () => {
    const domain = newExcludedDomain.trim().toLowerCase();
    if (!domain) return;
    if (extendedSettings.search.excludedDomains.includes(domain)) {
      toast.error('このドメインは既に除外リストに登録されています');
      return;
    }
    updateSearch({
      excludedDomains: [...extendedSettings.search.excludedDomains, domain],
    });
    setNewExcludedDomain('');
    toast.success('除外ドメインを追加しました');
  };
  
  const handleRemoveExcludedDomain = (domain: string) => {
    updateSearch({
      excludedDomains: extendedSettings.search.excludedDomains.filter(d => d !== domain),
    });
    toast.success('除外ドメインを削除しました');
  };
  
  // Filetype handlers
  const handleAddFiletype = () => {
    const filetype = newFiletype.trim().toLowerCase().replace('.', '');
    if (!filetype) return;
    if (extendedSettings.search.filetypes.includes(filetype)) {
      toast.error('このファイル形式は既に登録されています');
      return;
    }
    updateSearch({
      filetypes: [...extendedSettings.search.filetypes, filetype],
    });
    setNewFiletype('');
    toast.success('ファイル形式を追加しました');
  };
  
  const handleRemoveFiletype = (filetype: string) => {
    updateSearch({
      filetypes: extendedSettings.search.filetypes.filter(f => f !== filetype),
    });
    toast.success('ファイル形式を削除しました');
  };
  
  // Scope handlers
  const handleAddScope = () => {
    const scope = newScope.trim();
    if (!scope) return;
    if (allScopes.includes(scope)) {
      toast.error('この範囲は既に登録されています');
      return;
    }
    setCustomScopes(prev => [...prev, scope]);
    setNewScope('');
    toast.success('対象範囲を追加しました');
  };
  
  const handleRemoveScope = (scope: string) => {
    if (DEFAULT_SCOPE_OPTIONS.includes(scope)) {
      toast.error('デフォルト範囲は削除できません');
      return;
    }
    setCustomScopes(prev => prev.filter(s => s !== scope));
    toast.success('対象範囲を削除しました');
  };
  
  // Audience handlers
  const handleAddAudience = () => {
    const audience = newAudience.trim();
    if (!audience) return;
    if (allAudiences.includes(audience)) {
      toast.error('この対象者は既に登録されています');
      return;
    }
    setCustomAudiences(prev => [...prev, audience]);
    setNewAudience('');
    toast.success('対象者を追加しました');
  };
  
  const handleRemoveAudience = (audience: string) => {
    if (DEFAULT_AUDIENCE_OPTIONS.includes(audience)) {
      toast.error('デフォルト対象者は削除できません');
      return;
    }
    setCustomAudiences(prev => prev.filter(a => a !== audience));
    toast.success('対象者を削除しました');
  };
  
  // Export all settings
  const handleExportSettings = () => {
    const exportData = {
      version: 2,
      exportDate: new Date().toISOString(),
      extendedSettings,
      customPresets,
      customDomains,
      customScopes,
      customAudiences,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medai-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('設定をエクスポートしました');
  };
  
  // Import settings
  const handleImportSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (data.version === 2 && data.extendedSettings) {
          setExtendedSettings(data.extendedSettings);
        }
        if (data.customPresets) {
          setCustomPresets(data.customPresets);
        }
        if (data.customDomains) {
          setCustomDomains(data.customDomains);
        }
        if (data.customScopes) {
          setCustomScopes(data.customScopes);
        }
        if (data.customAudiences) {
          setCustomAudiences(data.customAudiences);
        }
        
        toast.success('設定をインポートしました');
      } catch (error) {
        toast.error('設定ファイルの読み込みに失敗しました');
      }
    };
    input.click();
  };
  
  // Reset all settings
  const handleResetAll = () => {
    setExtendedSettings(createDefaultExtendedSettings());
    setCustomPresets([]);
    setCustomDomains([]);
    setCustomScopes([]);
    setCustomAudiences([]);
    setResetConfirmOpen(false);
    toast.success('すべての設定をリセットしました');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center gap-4 h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">設定</h1>
              <p className="text-xs text-muted-foreground">
                テンプレート・検索・出力・UIの詳細設定
              </p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto p-1 gap-1">
            <TabsTrigger value="template" className="gap-2 py-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">テンプレート</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2 py-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">検索</span>
            </TabsTrigger>
            <TabsTrigger value="output" className="gap-2 py-2">
              <FileCode className="w-4 h-4" />
              <span className="hidden sm:inline">出力</span>
            </TabsTrigger>
            <TabsTrigger value="ui" className="gap-2 py-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">UI/UX</span>
            </TabsTrigger>
            <TabsTrigger value="presets" className="gap-2 py-2">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">プリセット</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2 py-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">データ</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Template Settings Tab */}
          <TabsContent value="template" className="space-y-6">
            <SettingsCard
              icon={BookOpen}
              title="Role定義"
              description="AIの役割と動作を定義するテキストを編集します"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Role タイトル</Label>
                  <Input
                    value={extendedSettings.template.roleTitle}
                    onChange={(e) => updateTemplate({ roleTitle: e.target.value })}
                    placeholder="例: 国内ガイドライン・ダイレクト・リトリーバー"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role 説明文</Label>
                  <Textarea
                    value={extendedSettings.template.roleDescription}
                    onChange={(e) => updateTemplate({ roleDescription: e.target.value })}
                    rows={5}
                    className="font-mono text-sm"
                    placeholder="AIの役割と制約を記述..."
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateTemplate({
                    roleTitle: DEFAULT_ROLE_TITLE,
                    roleDescription: DEFAULT_ROLE_DESCRIPTION,
                  })}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  デフォルトに戻す
                </Button>
              </div>
            </SettingsCard>
            
            <SettingsCard
              icon={Shield}
              title="免責事項・注意事項"
              description="プロンプトに含める免責事項を編集します"
            >
              <div className="space-y-4">
                <Textarea
                  value={extendedSettings.template.disclaimers.join('\n')}
                  onChange={(e) => updateTemplate({
                    disclaimers: e.target.value.split('\n').filter(Boolean),
                  })}
                  rows={4}
                  className="font-mono text-sm"
                  placeholder="免責事項を1行ずつ入力..."
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateTemplate({ disclaimers: [...DISCLAIMER_LINES] })}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  デフォルトに戻す
                </Button>
              </div>
            </SettingsCard>
            
            <SettingsCard
              icon={Layout}
              title="出力フォーマット"
              description="出力セクションの表示/非表示と順序を設定します"
            >
              <div className="space-y-2">
                {extendedSettings.template.outputSections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <div
                      key={section.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border',
                        section.enabled ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border'
                      )}
                    >
                      <Switch
                        checked={section.enabled}
                        onCheckedChange={(checked) => {
                          updateTemplate({
                            outputSections: extendedSettings.template.outputSections.map(s =>
                              s.id === section.id ? { ...s, enabled: checked } : s
                            ),
                          });
                        }}
                      />
                      <span className={cn(
                        'flex-1 text-sm',
                        !section.enabled && 'text-muted-foreground'
                      )}>
                        {section.name}
                      </span>
                    </div>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateTemplate({ outputSections: [...DEFAULT_OUTPUT_SECTIONS] })}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                デフォルトに戻す
              </Button>
            </SettingsCard>
            
            <SettingsCard
              icon={Sparkles}
              title="カスタム指示"
              description="プロンプトに追加するカスタム指示を入力します"
            >
              <Textarea
                value={extendedSettings.template.customInstructions}
                onChange={(e) => updateTemplate({ customInstructions: e.target.value })}
                rows={4}
                className="font-mono text-sm"
                placeholder="追加の指示やルールを入力..."
              />
            </SettingsCard>
          </TabsContent>
          
          {/* Search Settings Tab */}
          <TabsContent value="search" className="space-y-6">
            <SettingsCard
              icon={Search}
              title="検索演算子"
              description="検索クエリで使用する演算子を設定します"
            >
              <div className="space-y-4">
                <SettingsRow
                  label="site: 演算子を使用"
                  description="優先ドメインに対してsite:指定を併用"
                >
                  <Switch
                    checked={extendedSettings.search.useSiteOperator}
                    onCheckedChange={(checked) => updateSearch({ useSiteOperator: checked })}
                  />
                </SettingsRow>
                
                <SettingsRow
                  label="filetype: 演算子を使用"
                  description="特定のファイル形式を優先して検索"
                >
                  <Switch
                    checked={extendedSettings.search.useFiletypeOperator}
                    onCheckedChange={(checked) => updateSearch({ useFiletypeOperator: checked })}
                  />
                </SettingsRow>
                
                {extendedSettings.search.useFiletypeOperator && (
                  <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                    <Label className="text-sm">対象ファイル形式</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="例: pdf, html, doc"
                        value={newFiletype}
                        onChange={(e) => setNewFiletype(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddFiletype()}
                        className="flex-1"
                      />
                      <Button onClick={handleAddFiletype} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {extendedSettings.search.filetypes.map((ft) => (
                        <div
                          key={ft}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-sm"
                        >
                          <span>.{ft}</span>
                          <button
                            onClick={() => handleRemoveFiletype(ft)}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SettingsCard>
            
            <SettingsCard
              icon={Sliders}
              title="優先順位ルール"
              description="検索結果の優先順位を決定するルール"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>優先順位の基準</Label>
                  <Select
                    value={extendedSettings.search.priorityRule}
                    onValueChange={(value: SearchSettings['priorityRule']) => 
                      updateSearch({ priorityRule: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revised_date">改定日（最新版優先）</SelectItem>
                      <SelectItem value="published_date">公開日順</SelectItem>
                      <SelectItem value="relevance">関連度順</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>最大検索結果数: {extendedSettings.search.maxResults}</Label>
                  <Slider
                    value={[extendedSettings.search.maxResults]}
                    onValueChange={([value]) => updateSearch({ maxResults: value })}
                    min={5}
                    max={50}
                    step={5}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>再帰的参照の深さ: {extendedSettings.search.recursiveDepth}</Label>
                  <Slider
                    value={[extendedSettings.search.recursiveDepth]}
                    onValueChange={([value]) => updateSearch({ recursiveDepth: value })}
                    min={0}
                    max={5}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    一次資料内の参照をどこまで辿るか（0=参照を辿らない）
                  </p>
                </div>
              </div>
            </SettingsCard>
            
            <SettingsCard
              icon={Globe}
              title="除外ドメイン"
              description="検索結果から除外するドメインを設定します"
            >
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="例: example.com"
                    value={newExcludedDomain}
                    onChange={(e) => setNewExcludedDomain(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddExcludedDomain()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddExcludedDomain} className="gap-2">
                    <Plus className="w-4 h-4" />
                    追加
                  </Button>
                </div>
                
                {extendedSettings.search.excludedDomains.length > 0 ? (
                  <div className="grid gap-2">
                    {extendedSettings.search.excludedDomains.map((domain) => (
                      <div
                        key={domain}
                        className="flex items-center gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5"
                      >
                        <Globe className="w-4 h-4 text-destructive shrink-0" />
                        <span className="flex-1 font-mono text-sm">{domain}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExcludedDomain(domain)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    除外ドメインは設定されていません
                  </p>
                )}
              </div>
            </SettingsCard>
          </TabsContent>
          
          {/* Output Settings Tab */}
          <TabsContent value="output" className="space-y-6">
            <SettingsCard
              icon={Languages}
              title="言語設定"
              description="プロンプトと出力の言語設定"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>言語モード</Label>
                  <Select
                    value={extendedSettings.output.languageMode}
                    onValueChange={(value: OutputSettings['languageMode']) => 
                      updateOutput({ languageMode: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="japanese_only">日本語のみ</SelectItem>
                      <SelectItem value="mixed">日英混在</SelectItem>
                      <SelectItem value="english_priority">英語優先</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <SettingsRow
                  label="英語の専門用語を含める"
                  description="SaMD、AI等の英語表記を併記"
                >
                  <Switch
                    checked={extendedSettings.output.includeEnglishTerms}
                    onCheckedChange={(checked) => updateOutput({ includeEnglishTerms: checked })}
                  />
                </SettingsRow>
              </div>
            </SettingsCard>
            
            <SettingsCard
              icon={Scale}
              title="詳細度"
              description="出力の詳細度を設定します"
            >
              <div className="space-y-2">
                <Label>出力の詳細度</Label>
                <Select
                  value={extendedSettings.output.detailLevel}
                  onValueChange={(value: OutputSettings['detailLevel']) => 
                    updateOutput({ detailLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">簡潔版（要点のみ）</SelectItem>
                    <SelectItem value="standard">標準（バランス重視）</SelectItem>
                    <SelectItem value="detailed">詳細版（網羅的）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SettingsCard>
            
            <SettingsCard
              icon={FileCode}
              title="クロスリファレンス"
              description="法令参照とe-Gov連携の設定"
            >
              <div className="space-y-4">
                <SettingsRow
                  label="e-Gov法令クロスリファレンス"
                  description="関連法令をe-Gov APIで取得"
                >
                  <Switch
                    checked={extendedSettings.output.eGovCrossReference}
                    onCheckedChange={(checked) => updateOutput({ eGovCrossReference: checked })}
                  />
                </SettingsRow>
                
                {extendedSettings.output.eGovCrossReference && (
                  <SettingsRow
                    label="法令条文の抜粋を含める"
                    description="関連条文の短い引用を出力に含める"
                  >
                    <Switch
                      checked={extendedSettings.output.includeLawExcerpts}
                      onCheckedChange={(checked) => updateOutput({ includeLawExcerpts: checked })}
                    />
                  </SettingsRow>
                )}
                
                <SettingsRow
                  label="検索ログを含める"
                  description="使用した検索語と参照ドメインを出力"
                >
                  <Switch
                    checked={extendedSettings.output.includeSearchLog}
                    onCheckedChange={(checked) => updateOutput({ includeSearchLog: checked })}
                  />
                </SettingsRow>
              </div>
            </SettingsCard>
            
            <SettingsCard
              icon={FileText}
              title="出力形式"
              description="プロンプト出力の形式を設定"
            >
              <div className="space-y-2">
                <Label>出力形式</Label>
                <Select
                  value={extendedSettings.output.outputFormat}
                  onValueChange={(value: OutputSettings['outputFormat']) => 
                    updateOutput({ outputFormat: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="plain_text">プレーンテキスト</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SettingsCard>
          </TabsContent>
          
          {/* UI/UX Settings Tab */}
          <TabsContent value="ui" className="space-y-6">
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
                      value === 'large' && 'text-lg',
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
          </TabsContent>
          
          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-6">
            <SettingsCard
              icon={Layers}
              title="目的プリセット"
              description="探索目的に応じたカテゴリと検索語のプリセットを管理します"
            >
              <Button onClick={handleNewPreset} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                新規プリセット作成
              </Button>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="default">
                  <AccordionTrigger className="text-sm font-medium">
                    デフォルトプリセット ({TAB_PRESETS.length}件)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {TAB_PRESETS.map((preset) => (
                        <div
                          key={preset.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{preset.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {preset.categories.length}カテゴリ / {preset.keywordChips.length}検索語
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPreset(preset)}
                            className="gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            複製して編集
                          </Button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {customPresets.length > 0 && (
                  <AccordionItem value="custom">
                    <AccordionTrigger className="text-sm font-medium">
                      カスタムプリセット ({customPresets.length}件)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {customPresets.map((preset) => (
                          <div
                            key={preset.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm">{preset.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {preset.categories.length}カテゴリ / {preset.keywordChips.length}検索語
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPreset(preset)}
                              className="gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              編集
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePreset(preset.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </SettingsCard>
            
            <SettingsCard
              icon={Globe}
              title="優先ドメイン"
              description="検索時に優先するドメインを管理します"
            >
              <div className="flex gap-2">
                <Input
                  placeholder="例: example.go.jp"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                  className="flex-1"
                />
                <Button onClick={handleAddDomain} className="gap-2">
                  <Plus className="w-4 h-4" />
                  追加
                </Button>
              </div>
              
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-4">
                  {allDomains.map((domain) => {
                    const isDefault = DEFAULT_PRIORITY_DOMAINS.includes(domain);
                    return (
                      <div
                        key={domain}
                        className={cn(
                          'flex items-center gap-3 p-2 rounded-lg border',
                          isDefault ? 'bg-muted/30 border-border' : 'bg-primary/5 border-primary/30'
                        )}
                      >
                        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 font-mono text-xs">{domain}</span>
                        {isDefault ? (
                          <span className="text-xs text-muted-foreground">デフォルト</span>
                        ) : (
                          <button
                            onClick={() => handleRemoveDomain(domain)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </SettingsCard>
            
            <div className="grid gap-6 md:grid-cols-2">
              <SettingsCard
                icon={Layers}
                title="対象範囲オプション"
                description="探索条件で選択できる対象範囲"
              >
                <div className="flex gap-2">
                  <Input
                    placeholder="例: 遠隔医療"
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddScope()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddScope} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {allScopes.map((scope) => {
                    const isDefault = DEFAULT_SCOPE_OPTIONS.includes(scope);
                    return (
                      <div
                        key={scope}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                          isDefault ? 'bg-muted' : 'bg-primary/10 text-primary'
                        )}
                      >
                        <span>{scope}</span>
                        {!isDefault && (
                          <button
                            onClick={() => handleRemoveScope(scope)}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SettingsCard>
              
              <SettingsCard
                icon={Layers}
                title="対象者オプション"
                description="探索条件で選択できる対象者"
              >
                <div className="flex gap-2">
                  <Input
                    placeholder="例: 患者"
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAudience()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddAudience} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {allAudiences.map((audience) => {
                    const isDefault = DEFAULT_AUDIENCE_OPTIONS.includes(audience);
                    return (
                      <div
                        key={audience}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                          isDefault ? 'bg-muted' : 'bg-primary/10 text-primary'
                        )}
                      >
                        <span>{audience}</span>
                        {!isDefault && (
                          <button
                            onClick={() => handleRemoveAudience(audience)}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SettingsCard>
            </div>
          </TabsContent>
          
          {/* Data Management Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <SettingsCard
                icon={Download}
                title="エクスポート"
                description="すべての設定をJSONファイルに保存"
              >
                <Button onClick={handleExportSettings} className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  設定をエクスポート
                </Button>
              </SettingsCard>
              
              <SettingsCard
                icon={Upload}
                title="インポート"
                description="JSONファイルから設定を復元"
              >
                <Button onClick={handleImportSettings} variant="outline" className="w-full gap-2">
                  <Upload className="w-4 h-4" />
                  設定をインポート
                </Button>
              </SettingsCard>
            </div>
            
            <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5 space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-destructive">すべての設定をリセット</h3>
                  <p className="text-sm text-muted-foreground">
                    カスタムプリセット、ドメイン、テンプレート設定、UI設定をすべて削除し、デフォルト状態に戻します。この操作は取り消せません。
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => setResetConfirmOpen(true)}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                すべてリセット
              </Button>
            </div>
            
            <div className="p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground space-y-1">
              <p><strong>テンプレート基準日:</strong> {TEMPLATE_BASE_DATE}</p>
              <p><strong>設定バージョン:</strong> {extendedSettings.version}</p>
              <p><strong>最終更新:</strong> {new Date(extendedSettings.lastUpdated).toLocaleString('ja-JP')}</p>
              <p className="mt-2">
                カスタムプリセット: {customPresets.length}件 / 
                カスタムドメイン: {customDomains.length}件 / 
                カスタム範囲: {customScopes.length}件 / 
                カスタム対象者: {customAudiences.length}件 /
                除外ドメイン: {extendedSettings.search.excludedDomains.length}件
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Preset Edit Dialog */}
      <Dialog open={!!editingPreset} onOpenChange={(open) => !open && setEditingPreset(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isNewPreset ? '新規プリセット作成' : 'プリセット編集'}
            </DialogTitle>
            <DialogDescription>
              カテゴリと検索語は1行に1つずつ入力してください
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">プリセット名 *</Label>
              <Input
                id="preset-name"
                value={presetForm.name}
                onChange={(e) => setPresetForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例: カスタム医療AI探索"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preset-categories">カテゴリ（1行1カテゴリ）</Label>
              <Textarea
                id="preset-categories"
                value={presetForm.categories}
                onChange={(e) => setPresetForm(prev => ({ ...prev, categories: e.target.value }))}
                rows={5}
                placeholder="医療機器規制とSaMD&#10;臨床評価と性能評価&#10;品質マネジメント"
                className="font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preset-keywords">検索語（1行1検索語）</Label>
              <Textarea
                id="preset-keywords"
                value={presetForm.keywordChips}
                onChange={(e) => setPresetForm(prev => ({ ...prev, keywordChips: e.target.value }))}
                rows={5}
                placeholder="医療AI ガイドライン 国内&#10;SaMD 承認申請 手引き&#10;PMDA プログラム医療機器"
                className="font-mono text-sm"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPreset(null)}>
              キャンセル
            </Button>
            <Button onClick={handleSavePreset} className="gap-2">
              <Save className="w-4 h-4" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirm Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>プリセットを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。プリセットは完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePreset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Reset Confirm Dialog */}
      <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>すべての設定をリセットしますか？</AlertDialogTitle>
            <AlertDialogDescription>
              カスタムプリセット、ドメイン、テンプレート設定、UI設定がすべて削除され、デフォルト状態に戻ります。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              リセット
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
