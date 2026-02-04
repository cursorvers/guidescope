/**
 * LLM Information and Optimization
 * 各LLMの特性、無料版/有料版の差分、プロンプト最適化
 */

export type LLMProvider = 'gemini' | 'chatgpt' | 'claude' | 'perplexity' | 'copilot';
export type LLMTier = 'free' | 'paid';

export interface LLMModel {
  id: string;
  name: string;
  provider: LLMProvider;
  tier: LLMTier;
  hasWebBrowsing: boolean;
  maxTokens: number;
  contextWindow: number;
  features: string[];
  limitations: string[];
  tips: string[];
  promptAdjustments?: {
    removeEgovApi?: boolean;
    simplifyInstructions?: boolean;
    reduceRecursiveDepth?: boolean;
    addSearchTips?: boolean;
  };
}

export interface LLMProviderInfo {
  id: LLMProvider;
  name: string;
  icon: string;
  color: string;
  description: string;
  freeModel: LLMModel;
  paidModels: LLMModel[];
}

// LLMプロバイダー情報
export const LLM_PROVIDERS: LLMProviderInfo[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '✦',
    color: '#4285F4',
    description: 'Googleの最新AI。ブラウジング機能が強力',
    freeModel: {
      id: 'gemini-flash-free',
      name: 'Gemini 1.5 Flash (無料)',
      provider: 'gemini',
      tier: 'free',
      hasWebBrowsing: true,
      maxTokens: 8192,
      contextWindow: 128000,
      features: [
        'Web検索・ブラウジング対応',
        '長文コンテキスト（128K）',
        'PDF読み取り可能',
        '日本語対応良好',
      ],
      limitations: [
        '1日あたりのリクエスト数制限',
        '複雑な推論は精度低下の可能性',
        'Deep Research機能なし',
      ],
      tips: [
        'シンプルな検索クエリから始める',
        '1回の検索で3-5件程度に絞る',
      ],
      promptAdjustments: {
        simplifyInstructions: true,
        reduceRecursiveDepth: true,
      },
    },
    paidModels: [
      {
        id: 'gemini-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'gemini',
        tier: 'paid',
        hasWebBrowsing: true,
        maxTokens: 32768,
        contextWindow: 1000000,
        features: [
          'Web検索・ブラウジング対応',
          '超長文コンテキスト（1M）',
          'PDF読み取り可能',
          '高精度な推論',
          'コード実行可能',
        ],
        limitations: [
          'API利用は従量課金',
        ],
        tips: [
          'Deep Research機能を活用',
          '複数文書の同時分析が可能',
        ],
      },
      {
        id: 'gemini-2-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'gemini',
        tier: 'paid',
        hasWebBrowsing: true,
        maxTokens: 32768,
        contextWindow: 1000000,
        features: [
          'Web検索・ブラウジング対応',
          '超長文コンテキスト（1M）',
          'マルチモーダル対応強化',
          '高速レスポンス',
          'Deep Research対応',
        ],
        limitations: [],
        tips: [
          'Deep Researchで網羅的な検索が可能',
          'e-Gov API直接アクセス推奨',
        ],
      },
    ],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '◉',
    color: '#10A37F',
    description: 'OpenAIの対話AI。Browse with Bing対応',
    freeModel: {
      id: 'gpt-4o-mini-free',
      name: 'GPT-4o mini (無料)',
      provider: 'chatgpt',
      tier: 'free',
      hasWebBrowsing: false,
      maxTokens: 4096,
      contextWindow: 128000,
      features: [
        '高速レスポンス',
        '日本語対応良好',
        'コンテキスト128K',
      ],
      limitations: [
        'Web検索機能なし（無料版）',
        '最新情報の取得不可',
        'PDF直接読み取り不可',
      ],
      tips: [
        '事前に検索結果をコピペして使用',
        'ガイドライン名を正確に指定',
      ],
      promptAdjustments: {
        removeEgovApi: true,
        simplifyInstructions: true,
        addSearchTips: true,
      },
    },
    paidModels: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o (Plus/Team)',
        provider: 'chatgpt',
        tier: 'paid',
        hasWebBrowsing: true,
        maxTokens: 16384,
        contextWindow: 128000,
        features: [
          'Browse with Bing対応',
          '高精度な推論',
          'コード実行可能',
          'ファイルアップロード対応',
          'DALL-E画像生成',
        ],
        limitations: [
          'Bing検索経由のため一部サイト非対応',
          'e-Gov API直接アクセス不安定',
        ],
        tips: [
          'site:指定を活用',
          'PDF URLを直接指定して読み取り',
        ],
        promptAdjustments: {
          removeEgovApi: true,
        },
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'chatgpt',
        tier: 'paid',
        hasWebBrowsing: true,
        maxTokens: 32768,
        contextWindow: 128000,
        features: [
          'Browse with Bing対応',
          '最高精度の推論',
          '長文出力対応',
        ],
        limitations: [
          'レスポンスがやや遅い',
        ],
        tips: [
          '複雑な分析タスクに最適',
        ],
        promptAdjustments: {
          removeEgovApi: true,
        },
      },
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: '◈',
    color: '#D97706',
    description: 'Anthropicの対話AI。長文処理に強い',
    freeModel: {
      id: 'claude-3-sonnet-free',
      name: 'Claude 3.5 Sonnet (無料)',
      provider: 'claude',
      tier: 'free',
      hasWebBrowsing: false,
      maxTokens: 4096,
      contextWindow: 200000,
      features: [
        '超長文コンテキスト（200K）',
        '高精度な日本語処理',
        'PDF/ドキュメント分析',
        'Artifacts機能',
      ],
      limitations: [
        'Web検索機能なし',
        '最新情報の取得不可',
        '1日あたりのメッセージ数制限',
      ],
      tips: [
        'PDFをアップロードして分析',
        '事前に検索結果をコピペ',
      ],
      promptAdjustments: {
        removeEgovApi: true,
        simplifyInstructions: true,
        addSearchTips: true,
      },
    },
    paidModels: [
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus (Pro)',
        provider: 'claude',
        tier: 'paid',
        hasWebBrowsing: false,
        maxTokens: 8192,
        contextWindow: 200000,
        features: [
          '最高精度の推論',
          '超長文コンテキスト（200K）',
          '複雑なタスク処理',
          'Artifacts機能',
        ],
        limitations: [
          'Web検索機能なし',
          'PDFアップロードで対応',
        ],
        tips: [
          '複数PDFを同時アップロード',
          '詳細な分析・比較に最適',
        ],
        promptAdjustments: {
          removeEgovApi: true,
          addSearchTips: true,
        },
      },
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet (Pro)',
        provider: 'claude',
        tier: 'paid',
        hasWebBrowsing: false,
        maxTokens: 8192,
        contextWindow: 200000,
        features: [
          '高速かつ高精度',
          '超長文コンテキスト（200K）',
          'Artifacts機能',
          'コード実行可能',
        ],
        limitations: [
          'Web検索機能なし',
        ],
        tips: [
          'バランスの取れた選択肢',
          'PDFアップロードで対応',
        ],
        promptAdjustments: {
          removeEgovApi: true,
          addSearchTips: true,
        },
      },
    ],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: '◎',
    color: '#6366F1',
    description: '検索特化AI。リアルタイム情報に強い',
    freeModel: {
      id: 'perplexity-free',
      name: 'Perplexity (無料)',
      provider: 'perplexity',
      tier: 'free',
      hasWebBrowsing: true,
      maxTokens: 4096,
      contextWindow: 32000,
      features: [
        'リアルタイムWeb検索',
        '出典URL自動表示',
        '日本語対応',
      ],
      limitations: [
        '1日あたりの検索数制限',
        'Pro Search機能なし',
        'ファイルアップロード制限',
      ],
      tips: [
        'シンプルな検索クエリで使用',
        '出典リンクを確認',
      ],
      promptAdjustments: {
        simplifyInstructions: true,
        reduceRecursiveDepth: true,
      },
    },
    paidModels: [
      {
        id: 'perplexity-pro',
        name: 'Perplexity Pro',
        provider: 'perplexity',
        tier: 'paid',
        hasWebBrowsing: true,
        maxTokens: 8192,
        contextWindow: 128000,
        features: [
          'Pro Search（深掘り検索）',
          '無制限検索',
          'ファイルアップロード対応',
          'GPT-4/Claude選択可能',
        ],
        limitations: [],
        tips: [
          'Pro Searchで網羅的な検索',
          '複数ソースの自動統合',
        ],
      },
    ],
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    icon: '◇',
    color: '#0078D4',
    description: 'MicrosoftのAI。Bing検索連携',
    freeModel: {
      id: 'copilot-free',
      name: 'Copilot (無料)',
      provider: 'copilot',
      tier: 'free',
      hasWebBrowsing: true,
      maxTokens: 4096,
      contextWindow: 32000,
      features: [
        'Bing検索連携',
        '出典URL表示',
        'Edge統合',
      ],
      limitations: [
        '1日あたりの会話数制限',
        '長文出力制限',
        '複雑なタスクは精度低下',
      ],
      tips: [
        'Edgeブラウザで使用推奨',
        'シンプルな検索から開始',
      ],
      promptAdjustments: {
        simplifyInstructions: true,
        reduceRecursiveDepth: true,
      },
    },
    paidModels: [
      {
        id: 'copilot-pro',
        name: 'Copilot Pro',
        provider: 'copilot',
        tier: 'paid',
        hasWebBrowsing: true,
        maxTokens: 8192,
        contextWindow: 128000,
        features: [
          'GPT-4 Turbo使用',
          '優先アクセス',
          'Office統合',
          'DALL-E画像生成',
        ],
        limitations: [],
        tips: [
          'Office文書との連携が便利',
          'Word/Excelでの整理に活用',
        ],
      },
    ],
  },
];

// LLMプロバイダーを取得
export function getLLMProvider(providerId: LLMProvider): LLMProviderInfo | undefined {
  return LLM_PROVIDERS.find(p => p.id === providerId);
}

// LLMモデルを取得
export function getLLMModel(providerId: LLMProvider, modelId: string): LLMModel | undefined {
  const provider = getLLMProvider(providerId);
  if (!provider) return undefined;
  
  if (provider.freeModel.id === modelId) return provider.freeModel;
  return provider.paidModels.find(m => m.id === modelId);
}

// 無料版と有料版の差分を取得
export function getFreePaidDiff(providerId: LLMProvider): {
  freeFeatures: string[];
  paidOnlyFeatures: string[];
  freeLimitations: string[];
} {
  const provider = getLLMProvider(providerId);
  if (!provider) {
    return { freeFeatures: [], paidOnlyFeatures: [], freeLimitations: [] };
  }

  const freeFeatures = provider.freeModel.features;
  const freeLimitations = provider.freeModel.limitations;
  
  // 有料版のみの機能を抽出
  const allPaidFeatures = provider.paidModels.flatMap(m => m.features);
  const paidOnlyFeatures = Array.from(new Set(allPaidFeatures)).filter(
    f => !freeFeatures.includes(f)
  );

  return { freeFeatures, paidOnlyFeatures, freeLimitations };
}

// プロンプト調整を適用
export function adjustPromptForLLM(
  prompt: string,
  model: LLMModel
): string {
  let adjustedPrompt = prompt;
  const adj = model.promptAdjustments;

  if (!adj) return adjustedPrompt;

  // e-Gov API部分を削除
  if (adj.removeEgovApi) {
    adjustedPrompt = adjustedPrompt.replace(
      /EGOV_SECTION_BEGIN[\s\S]*?EGOV_SECTION_END/g,
      ''
    );
    adjustedPrompt = adjustedPrompt.replace(
      /6\. e-Gov法令取得[\s\S]*?(?=\n\n#|\n\n##|$)/,
      ''
    );
  }

  // 再帰的参照の深さを減らす
  if (adj.reduceRecursiveDepth) {
    adjustedPrompt = adjustedPrompt.replace(
      /（最大\d+階層まで）/g,
      '（最大1階層まで）'
    );
  }

  // 検索のヒントを追加
  if (adj.addSearchTips && !model.hasWebBrowsing) {
    const searchTip = `
# 事前準備（Web検索機能がない場合）
このLLMにはWeb検索機能がないため、以下の手順で使用してください：
1. 別途ブラウザで検索を行い、関連するガイドラインのPDFをダウンロード
2. PDFをこのチャットにアップロード
3. 本プロンプトの指示に従って分析を依頼

`;
    adjustedPrompt = searchTip + adjustedPrompt;
  }

  // 指示を簡略化
  if (adj.simplifyInstructions) {
    // Phase 4を簡略化
    adjustedPrompt = adjustedPrompt.replace(
      /## Phase 4: 法令クロスリファレンス[\s\S]*?(?=\n\n#)/,
      '## Phase 4: 法令参照（オプション）\n可能であれば、関連法令名を記載する。\n\n'
    );
  }

  return adjustedPrompt.trim();
}

// デフォルトのLLM設定
export const DEFAULT_LLM_PROVIDER: LLMProvider = 'gemini';
export const DEFAULT_LLM_MODEL = 'gemini-2-flash';
