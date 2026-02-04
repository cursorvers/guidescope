/**
 * Medical AI Prompt Builder - Home Page
 * シンプル＆クリーンなデザイン、複数LLM対応
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import {
  Settings,
  Copy,
  Download,
  Upload,
  Share2,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Check,
  AlertCircle,
  Info,
  Sparkles,
} from 'lucide-react';

import { TAB_PRESETS, type AppConfig } from '@/lib/presets';
import { generatePrompt, generateSearchQueries, configToJSON, parseConfigJSON, encodeConfigToURL } from '@/lib/template';
import { LLM_PROVIDERS, getLLMProvider, getLLMModel, getFreePaidDiff, adjustPromptForLLM, type LLMProvider, DEFAULT_LLM_PROVIDER } from '@/lib/llm';
import { useConfig } from '@/hooks/useConfig';

export default function Home() {
  const {
    config,
    resetConfig,
    switchTab,
    updateField,
    toggleCategory,
    toggleKeywordChip,
    toggleScope,
    toggleAudience,
    setCustomKeywords,
    importConfig,
  } = useConfig();

  const [selectedLLM, setSelectedLLM] = useState<LLMProvider>(DEFAULT_LLM_PROVIDER);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [showLLMInfo, setShowLLMInfo] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState({
    scope: true,
    audience: true,
    options: false,
    categories: false,
    keywords: false,
    domains: false,
  });

  // 全プリセット
  const allPresets = useMemo(() => TAB_PRESETS, []);

  // 現在のプリセット
  const currentPreset = useMemo(() => {
    return allPresets.find(p => p.id === config.activeTab) || TAB_PRESETS[0];
  }, [allPresets, config.activeTab]);

  // 選択中のLLMプロバイダー情報
  const llmProvider = useMemo(() => getLLMProvider(selectedLLM), [selectedLLM]);
  
  // 選択中のモデル
  const selectedModel = useMemo(() => {
    if (!llmProvider) return null;
    if (!selectedModelId) return llmProvider.freeModel;
    return getLLMModel(selectedLLM, selectedModelId) || llmProvider.freeModel;
  }, [llmProvider, selectedLLM, selectedModelId]);

  // 無料版/有料版の差分
  const freePaidDiff = useMemo(() => getFreePaidDiff(selectedLLM), [selectedLLM]);

  // プロンプト生成
  const generatedPrompt = useMemo(() => {
    const basePrompt = generatePrompt(config);
    if (selectedModel) {
      return adjustPromptForLLM(basePrompt, selectedModel);
    }
    return basePrompt;
  }, [config, selectedModel]);

  // 検索クエリ生成
  const searchQueries = useMemo(() => generateSearchQueries(config), [config]);

  // LLM変更時にモデルをリセット
  useEffect(() => {
    if (llmProvider) {
      setSelectedModelId(llmProvider.freeModel.id);
    }
  }, [selectedLLM, llmProvider]);

  // コピー
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast.success('プロンプトをコピーしました');
    } catch {
      toast.error('コピーに失敗しました');
    }
  };

  // ダウンロード
  const handleDownload = () => {
    const blob = new Blob([generatedPrompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt_${config.dateToday}_${selectedLLM}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('ダウンロードしました');
  };

  // JSON エクスポート
  const handleExportJSON = () => {
    const json = configToJSON(config);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config_${config.dateToday}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('設定をエクスポートしました');
  };

  // JSON インポート
  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const json = e.target?.result as string;
          if (importConfig(json)) {
            toast.success('設定をインポートしました');
          } else {
            toast.error('無効なJSONファイルです');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 共有リンク
  const handleShare = async () => {
    const url = encodeConfigToURL(config);
    try {
      await navigator.clipboard.writeText(url);
      toast.success('共有リンクをコピーしました');
    } catch {
      toast.error('コピーに失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">医療AIガイドライン探索</h1>
              <p className="text-xs text-muted-foreground">プロンプトビルダー</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {config.dateToday}
            </span>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-4">
        {/* LLM選択 */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Label className="text-sm font-medium">対象LLM:</Label>
            <div className="flex flex-wrap gap-1">
              {LLM_PROVIDERS.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedLLM(provider.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    selectedLLM === provider.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                  style={selectedLLM === provider.id ? { backgroundColor: provider.color } : {}}
                >
                  <span className="mr-1">{provider.icon}</span>
                  <span className="hidden sm:inline">{provider.name}</span>
                  <span className="sm:hidden">{provider.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* モデル選択 */}
          {llmProvider && (
            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-sm">モデル:</Label>
              <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                <SelectTrigger className="w-[200px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={llmProvider.freeModel.id}>
                    {llmProvider.freeModel.name}
                  </SelectItem>
                  {llmProvider.paidModels.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLLMInfo(!showLLMInfo)}
                className="text-xs"
              >
                <Info className="w-3 h-3 mr-1" />
                {showLLMInfo ? '閉じる' : '詳細'}
              </Button>
            </div>
          )}

          {/* LLM詳細情報 */}
          {showLLMInfo && selectedModel && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-1 flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-600" />
                    機能
                  </h4>
                  <ul className="space-y-0.5 text-xs text-muted-foreground">
                    {selectedModel.features.map((f, i) => (
                      <li key={i}>・{f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-yellow-600" />
                    制限事項
                  </h4>
                  <ul className="space-y-0.5 text-xs text-muted-foreground">
                    {selectedModel.limitations.length > 0 ? (
                      selectedModel.limitations.map((l, i) => (
                        <li key={i}>・{l}</li>
                      ))
                    ) : (
                      <li>・特になし</li>
                    )}
                  </ul>
                </div>
              </div>
              {selectedModel.tier === 'free' && freePaidDiff.paidOnlyFeatures.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <h4 className="font-medium mb-1 text-xs text-primary">
                    有料版で追加される機能:
                  </h4>
                  <ul className="flex flex-wrap gap-1">
                    {freePaidDiff.paidOnlyFeatures.slice(0, 5).map((f, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                        {f}
                      </span>
                    ))}
                  </ul>
                </div>
              )}
              {selectedModel.tips.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <h4 className="font-medium mb-1 text-xs">💡 Tips:</h4>
                  <ul className="text-xs text-muted-foreground">
                    {selectedModel.tips.map((t, i) => (
                      <li key={i}>・{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* メインコンテンツ */}
        <div className="grid gap-4 lg:grid-cols-[400px_1fr]">
          {/* 左カラム: 設定 */}
          <div className="space-y-3">
            {/* 目的プリセット */}
            <div className="simple-card p-3">
              <Label className="text-sm font-medium mb-2 block">目的プリセット</Label>
              <div className="flex flex-wrap gap-1">
                {allPresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => switchTab(preset.id)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      config.activeTab === preset.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 探索テーマ */}
            <div className="simple-card p-3">
              <Label htmlFor="query" className="text-sm font-medium">
                探索テーマ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="query"
                value={config.query}
                onChange={(e) => updateField('query', e.target.value)}
                placeholder="例: 医療AIの臨床導入における安全管理"
                className="mt-1"
              />
            </div>

            {/* 対象範囲 */}
            <Collapsible
              open={sectionsOpen.scope}
              onOpenChange={(open) => setSectionsOpen({ ...sectionsOpen, scope: open })}
            >
              <div className="simple-card">
                <CollapsibleTrigger className="collapsible-header">
                  <span className="text-sm font-medium">対象範囲</span>
                  {sectionsOpen.scope ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="collapsible-content">
                  <div className="flex flex-wrap gap-1.5">
                    {['医療AI', '生成AI', 'SaMD', '医療情報セキュリティ', '医療データ利活用', '研究倫理'].map(scope => (
                      <button
                        key={scope}
                        onClick={() => toggleScope(scope)}
                        className={`chip ${config.scope.includes(scope) ? 'active' : ''}`}
                      >
                        {scope}
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* 対象者 */}
            <Collapsible
              open={sectionsOpen.audience}
              onOpenChange={(open) => setSectionsOpen({ ...sectionsOpen, audience: open })}
            >
              <div className="simple-card">
                <CollapsibleTrigger className="collapsible-header">
                  <span className="text-sm font-medium">対象者</span>
                  {sectionsOpen.audience ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="collapsible-content">
                  <div className="flex flex-wrap gap-1.5">
                    {['医療機関', '提供事業者', '開発企業', '研究者', '審査対応'].map(audience => (
                      <button
                        key={audience}
                        onClick={() => toggleAudience(audience)}
                        className={`chip ${config.audiences.includes(audience) ? 'active' : ''}`}
                      >
                        {audience}
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* オプション */}
            <Collapsible
              open={sectionsOpen.options}
              onOpenChange={(open) => setSectionsOpen({ ...sectionsOpen, options: open })}
            >
              <div className="simple-card">
                <CollapsibleTrigger className="collapsible-header">
                  <span className="text-sm font-medium">オプション</span>
                  {sectionsOpen.options ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="collapsible-content">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="official" className="text-sm">公式ドメイン優先</Label>
                      <Switch
                        id="official"
                        checked={config.officialDomainPriority}
                        onCheckedChange={(checked) => updateField('officialDomainPriority', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="egov" className="text-sm">e-Gov法令参照</Label>
                      <Switch
                        id="egov"
                        checked={config.eGovCrossReference}
                        onCheckedChange={(checked) => updateField('eGovCrossReference', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="proof" className="text-sm">実証モード</Label>
                      <Switch
                        id="proof"
                        checked={config.proofMode}
                        onCheckedChange={(checked) => updateField('proofMode', checked)}
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* カテゴリ */}
            <Collapsible
              open={sectionsOpen.categories}
              onOpenChange={(open) => setSectionsOpen({ ...sectionsOpen, categories: open })}
            >
              <div className="simple-card">
                <CollapsibleTrigger className="collapsible-header">
                  <span className="text-sm font-medium">カテゴリ例</span>
                  {sectionsOpen.categories ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="collapsible-content">
                  <div className="flex flex-wrap gap-1.5">
                    {config.categories.map((cat, index) => (
                      <button
                        key={cat.name}
                        onClick={() => toggleCategory(index)}
                        className={`chip text-xs ${cat.enabled ? 'active' : ''}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* 追加検索語 */}
            <Collapsible
              open={sectionsOpen.keywords}
              onOpenChange={(open) => setSectionsOpen({ ...sectionsOpen, keywords: open })}
            >
              <div className="simple-card">
                <CollapsibleTrigger className="collapsible-header">
                  <span className="text-sm font-medium">追加検索語</span>
                  {sectionsOpen.keywords ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="collapsible-content">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {config.keywordChips.map((kw, index) => (
                      <button
                        key={kw.name}
                        onClick={() => toggleKeywordChip(index)}
                        className={`chip text-xs ${kw.enabled ? 'active' : ''}`}
                      >
                        {kw.name}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={config.customKeywords.join('\n')}
                    onChange={(e) => setCustomKeywords(e.target.value)}
                    placeholder="自由追加（1行1語）"
                    rows={2}
                    className="text-sm"
                  />
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* 優先ドメイン */}
            <Collapsible
              open={sectionsOpen.domains}
              onOpenChange={(open) => setSectionsOpen({ ...sectionsOpen, domains: open })}
            >
              <div className="simple-card">
                <CollapsibleTrigger className="collapsible-header">
                  <span className="text-sm font-medium">優先ドメイン</span>
                  {sectionsOpen.domains ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="collapsible-content">
                  <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                    {config.priorityDomains.map(domain => (
                      <span key={domain} className="px-2 py-0.5 bg-muted rounded">
                        {domain}
                      </span>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          {/* 右カラム: 出力 */}
          <div className="simple-card p-3">
            <Tabs defaultValue="prompt" className="h-full flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <TabsList className="h-8">
                  <TabsTrigger value="prompt" className="text-xs px-3">プロンプト</TabsTrigger>
                  <TabsTrigger value="queries" className="text-xs px-3">検索クエリ</TabsTrigger>
                  <TabsTrigger value="json" className="text-xs px-3">JSON</TabsTrigger>
                </TabsList>
                <div className="flex flex-wrap gap-1">
                  <Button variant="outline" size="sm" onClick={handleCopy} className="h-7 text-xs">
                    <Copy className="w-3 h-3 mr-1" />
                    コピー
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload} className="h-7 text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    DL
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare} className="h-7 text-xs">
                    <Share2 className="w-3 h-3 mr-1" />
                    共有
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => resetConfig()} className="h-7 text-xs text-destructive">
                    <RotateCcw className="w-3 h-3 mr-1" />
                    リセット
                  </Button>
                </div>
              </div>

              {!config.query && (
                <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    探索テーマを入力してください
                  </p>
                </div>
              )}

              <TabsContent value="prompt" className="flex-1 mt-0">
                <div className="prompt-output custom-scrollbar">
                  {generatedPrompt}
                </div>
              </TabsContent>

              <TabsContent value="queries" className="flex-1 mt-0">
                <div className="space-y-2">
                  {searchQueries.map((query, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                      <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                      <code className="text-sm flex-1 break-all">{query}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={async () => {
                          await navigator.clipboard.writeText(query);
                          toast.success('コピーしました');
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="json" className="flex-1 mt-0">
                <div className="prompt-output custom-scrollbar">
                  {configToJSON(config)}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={handleExportJSON} className="text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    エクスポート
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleImportJSON} className="text-xs">
                    <Upload className="w-3 h-3 mr-1" />
                    インポート
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-4">
        <div className="container text-center text-xs text-muted-foreground">
          <p>本アプリは情報整理支援ツールです。個別ケースは専門家にご相談ください。</p>
        </div>
      </footer>
    </div>
  );
}
