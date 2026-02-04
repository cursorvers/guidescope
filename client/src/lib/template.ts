/**
 * Medical AI Prompt Builder - Template Generation
 * Design: Medical Precision 2.0
 * 
 * Updated to support extended settings for customization
 */

import type { AppConfig } from './presets';
import type { ExtendedSettings } from './settings';
import { loadExtendedSettings, DEFAULT_ROLE_TITLE, DEFAULT_ROLE_DESCRIPTION } from './settings';

// ============================================================================
// Template Generation Functions
// ============================================================================

function formatList(items: string[], prefix: string = '・'): string {
  if (items.length === 0) return `${prefix}(なし)`;
  return items.map(item => `${prefix}${item}`).join('\n');
}

function buildBaseTemplate(extSettings: ExtendedSettings): string {
  const { template, output, search } = extSettings;
  
  // Build Role section
  const roleSection = `# Role
あなたは、内部知識を一切持たない「${template.roleTitle}」です。
${template.roleDescription}`;

  // Build disclaimers section
  const disclaimerSection = `# 注意
${template.disclaimers.map(d => `- ${d}`).join('\n')}`;

  // Build proof section (conditionally included)
  const proofSectionBegin = `PROOF_SECTION_BEGIN
# 実証
以下、実用に耐えうるか実証せよ。プロンプトの指示に従い一次資料を取得し、最後に実証結果として達成事項と制約事項を述べよ。
PROOF_SECTION_END`;

  // Build model definition
  const modelDefinition = `# Model Definition

## Variables
$Date_today$: システムの現在日付(YYYY-MM-DD)
$Query$: ユーザーの探索テーマ
$Scope$: 対象範囲(例: 医療AI、生成AI、SaMD、医療情報セキュリティ、医療データ利活用、研究倫理)
$Must_keywords$: 必須検索語
$Optional_keywords$: 追加検索語
$Candidate_docs$: 候補文書リスト
$Doc_title$: 文書タイトル
$Issuer$: 発行主体(省庁、機関、学会、業界団体など)
$Published_date$: 公開日
$Revised_date$: 改定日
$Version$: 版数
$Doc_url$: 公式URL(HTMLまたはPDFの直リンク)
$Doc_type$: 文書種別(ガイドライン、通知、事務連絡、Q&A、手引き、報告書、告示、法令など)
$Fetched_text$: $Doc_url$ から取得した本文テキスト

$Law_name$: 法令名
$Law_ID$: e-Gov法令ID
$U_xml$: e-Gov API URL
$U_web$: e-Gov Web URL
$Law_xml$: $U_xml$ から取得したXML`;

  // Build rules section
  let rulesSection = `## Rules (Strict Logic)
1. ゼロ知識
   ・一次資料を取得する前に、内容を断定しない
   ・一次資料に書かれていないことは「不明」とする
   ・推測で補完しない

2. 公式優先
   ・候補発見のために一般サイトを使ってよいが、内容の根拠は必ず公式一次資料に限る
   ・公式一次資料に到達できない場合は「公式資料未確認」と明記し、要約はしない
   ・優先ドメイン:
[[PRIORITY_DOMAINS_LIST]]`;

  // Add excluded domains if any
  if (search.excludedDomains.length > 0) {
    rulesSection += `
   ・除外ドメイン:
${search.excludedDomains.map(d => `     - ${d}`).join('\n')}`;
  }

  rulesSection += `

3. 版管理
   ・同名文書が複数版ある場合、${search.priorityRule === 'revised_date' ? '改定日が最も新しい最新版' : search.priorityRule === 'published_date' ? '公開日が最も新しい版' : '関連度が最も高い版'}を特定して採用する
   ・旧版も見つかった場合は「旧版」として別枠で併記する

4. 出力リンク形式
   ・出力するURLは必ず Markdown の [表示ラベル](URL) 形式で提示する
   ・生のURL文字列をそのまま表示しない

5. 再帰的参照
   ・一次資料内に別の指針、通知、Q&A、別添、関連ガイドライン、用語集、チェックリストが参照されている場合、リンクを辿って同様に取得し、一覧に追加する${search.recursiveDepth > 0 ? `（最大${search.recursiveDepth}階層まで）` : ''}
   ・重複は統合し、最新版を優先する`;

  // e-Gov section (conditionally included)
  const eGovSection = `EGOV_SECTION_BEGIN
6. e-Gov法令取得
   ・文書内に法令(法律、政令、省令、告示など)が参照されている場合、可能ならe-Govで法令IDを特定し、下記の正規フォーマットでAPIに直接アクセスしてXMLから条文を取得する
   ・検索エンジンURL、短縮URL、リダイレクトURLを生成しない${output.includeLawExcerpts ? '\n   ・該当条文の短い抜粋を含める' : ''}

   API用(固定フォーマット):
   https://laws.e-gov.go.jp/api/2/law_data/{$Law_ID}?applicable_date={$Date_today}

   Web用(固定フォーマット):
   https://laws.e-gov.go.jp/law/{$Law_ID}
EGOV_SECTION_END`;

  // Build task section
  const taskSection = `# Task

## Phase 1: 探索計画の確定
1. ユーザー入力から $Query と $Scope を整理する(目的、対象者、用途、期間)
2. $Must_keywords を確定する。必ず次を含める
   ・3省2ガイドライン
3. $Optional_keywords を生成する。検索語は${output.languageMode === 'japanese_only' ? '日本語を基本とする' : output.languageMode === 'english_priority' ? '英語を優先し、必要に応じて日本語も併用する' : '日本語を基本とし、必要に応じて英語(SaMD等)も併用する'}
   追加検索語候補:
[[OPTIONAL_KEYWORDS_LIST]]
4. ${search.useSiteOperator ? '優先ドメインに対して site: 指定も併用する(例: site:mhlw.go.jp 医療AI ガイドライン)' : '優先ドメインを参考に検索する'}
5. ${search.useFiletypeOperator && search.filetypes.length > 0 ? `filetype:${search.filetypes.join('/')} 指定を併用する` : '検索結果は必ず公開日・改定日を確認し、最新版らしいものを優先して開く'}

## Phase 2: 候補文書の収集と一次資料取得
1. 検索で見つかった候補を $Candidate_docs に記録する（最大${search.maxResults}件）
   ・タイトル、発行主体、版数、公開日、改定日、対象者、URL、文書種別、形式(PDF/HTML)
2. 各候補について $Doc_url を開き、本文 $Fetched_text を取得する
3. PDFの場合は本文を読み取り、医療AIに関係する箇所(AI、機械学習、生成AI、SaMD、医療機器、医療情報、匿名加工、仮名加工、委託、クラウド、越境移転、セキュリティ等)を特定する

## Phase 3: 必須テーマの確定
1. 「3省2ガイドライン」を構成する文書を、公式一次資料に基づいて確定する
   ・正式名称
   ・最新版の版数と改定日
   ・対象(医療機関向け、提供事業者向け等)
   ・公式URL(ページとPDF)
2. 医療AIに関する他の国内ガイドラインも、同様に最新版と根拠URLを確定する

## Phase 4: 法令クロスリファレンス(必要時)
1. 各文書で参照されている主要な法令名を抽出する
2. e-Govで法令IDを特定できる場合、固定フォーマットのAPI URLを生成してXMLを取得する
3. 医療AIに関係する条文参照がある場合のみ、該当条文を短く引用し、どの要求事項と紐付くか整理する
4. 法令IDを特定できない場合は「法令ID特定不能」と明記する`;

  // Build output format section based on enabled sections
  const enabledSections = template.outputSections
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order);
  
  let outputFormatSection = `# Output Format\n`;
  
  // Build each enabled section
  for (const section of enabledSections) {
    switch (section.id) {
      case 'disclaimer':
        outputFormatSection += `
■ 免責
・本出力は情報整理支援です。個別ケースについては有資格者など専門家にご相談下さい。
・本出力は[[DATE_TODAY]]時点の取得結果であり、更新があり得るため一次資料で確認すること。
`;
        break;
      case 'search_conditions':
        outputFormatSection += `
■ 検索条件
・日付: [[DATE_TODAY]]
・テーマ: [[QUERY]]
・範囲: [[SCOPE]]
・優先: 公式一次資料、最新版
`;
        break;
      case 'data_sources':
        outputFormatSection += `
■ 参照データソース
・各文書について [公式ページ](URL) と [PDF](URL) を列挙(存在する方のみ)
・法令は [XMLデータ(API)](U_xml) と [公式閲覧(e-Gov)](U_web)
`;
        break;
      case 'guideline_list':
        outputFormatSection += `
■ ガイドライン一覧
カテゴリ別に、各文書を次の項目で整理する
${output.detailLevel === 'concise' ? `・タイトル
・発行主体
・最新版の版数と改定日
・公式URL` : output.detailLevel === 'detailed' ? `・タイトル
・発行主体
・文書種別
・最新版の版数と改定日
・対象者と適用範囲
・医療AIとの関係(本文の根拠となる詳細な抜粋と要約)
・関連法令(e-Govリンク、該当条文の抜粋)
・関連する他のガイドライン
・実務上の重要ポイント` : `・タイトル
・発行主体
・文書種別
・最新版の版数と改定日
・対象者と適用範囲
・医療AIとの関係(本文の根拠となる短い抜粋と要約)
・関連法令(e-Govリンク、可能なら該当条文の短い抜粋)`}

カテゴリ例
[[CATEGORIES_LIST]]
`;
        break;
      case 'three_ministry':
        outputFormatSection += `
■ 3省2ガイドラインの確定結果
・構成文書の対応関係
・対象者の違い
・実務上の重要ポイント
`;
        break;
      case 'search_log':
        if (output.includeSearchLog) {
          outputFormatSection += `
■ 検索ログ
・実際に使った検索語
・参照した公式ドメイン一覧
・除外した候補と理由(例: 公式一次資料に到達できない)
`;
        }
        break;
      case 'guardrail':
        outputFormatSection += `
# Guardrail
・一次資料を開けない、本文を取得できない場合は、その旨を明記して推測しない
・最新版か不明な場合は、候補の改定日を比較し「最新版候補」として扱う
・出力リンクは必ず [表示ラベル](URL) 形式に統一する
・e-Govは上記の固定フォーマットのみを使い、検索エンジン経由のURL生成をしない
`;
        break;
    }
  }

  // Build input section
  const inputSection = `# Input
Date_today: [[DATE_TODAY]]
Query: [[QUERY]]
Scope: [[SCOPE]]

Audiences:
[[AUDIENCES_LIST]]

PriorityDomains:
[[PRIORITY_DOMAINS_LIST]]

Must_keywords:
[[MUST_KEYWORDS_LIST]]

Optional_keywords:
[[OPTIONAL_KEYWORDS_LIST]]

Exclude_keywords:
[[EXCLUDE_KEYWORDS_LIST]]

Instruction:
次の条件で検索と整理を実行せよ。
- 必須検索語: Must_keywords
- 追加検索語: Optional_keywords
- 除外キーワード: Exclude_keywords
- 対象者: Audiences
- 優先ドメイン: PriorityDomains
- 可能な限り公式一次資料(PDF含む)へ到達し、最新版を確定すること`;

  // Build proof result section
  const proofResultSection = `PROOF_SECTION_BEGIN
# 実証結果
最後に、本プロンプトが実用に耐えうるかを自己点検し、達成事項と制約事項を簡潔に述べよ。
PROOF_SECTION_END`;

  // Add custom instructions if any
  const customInstructionsSection = template.customInstructions.trim() 
    ? `\n# カスタム指示\n${template.customInstructions}\n` 
    : '';

  // Combine all sections
  return [
    roleSection,
    disclaimerSection,
    proofSectionBegin,
    modelDefinition,
    rulesSection,
    eGovSection,
    taskSection,
    outputFormatSection,
    inputSection,
    customInstructionsSection,
    proofResultSection,
  ].join('\n\n');
}

export function generatePrompt(config: AppConfig, extSettings?: ExtendedSettings): string {
  // Load extended settings if not provided
  const settings = extSettings || loadExtendedSettings();
  
  let prompt = buildBaseTemplate(settings);
  
  // Replace date
  prompt = prompt.replace(/\[\[DATE_TODAY\]\]/g, config.dateToday);
  
  // Replace query
  prompt = prompt.replace(/\[\[QUERY\]\]/g, config.query || '(未入力)');
  
  // Replace scope
  prompt = prompt.replace(/\[\[SCOPE\]\]/g, config.scope.join('、') || '(未指定)');
  
  // Replace audiences
  prompt = prompt.replace(
    '[[AUDIENCES_LIST]]',
    formatList(config.audiences)
  );
  
  // Replace priority domains
  prompt = prompt.replace(
    /\[\[PRIORITY_DOMAINS_LIST\]\]/g,
    formatList(config.priorityDomains)
  );
  
  // Build must keywords (always include 3省2ガイドライン)
  const mustKeywords = ['3省2ガイドライン'];
  prompt = prompt.replace(
    '[[MUST_KEYWORDS_LIST]]',
    formatList(mustKeywords)
  );
  
  // Build optional keywords from enabled chips + custom keywords
  const optionalKeywords = [
    ...config.keywordChips.filter(k => k.enabled).map(k => k.name),
    ...config.customKeywords.filter(k => k.trim()),
  ];
  prompt = prompt.replace(
    /\[\[OPTIONAL_KEYWORDS_LIST\]\]/g,
    formatList(optionalKeywords)
  );
  
  // Replace exclude keywords
  prompt = prompt.replace(
    '[[EXCLUDE_KEYWORDS_LIST]]',
    formatList(config.excludeKeywords.filter(k => k.trim()))
  );
  
  // Replace categories
  const enabledCategories = config.categories.filter(c => c.enabled).map(c => c.name);
  prompt = prompt.replace(
    '[[CATEGORIES_LIST]]',
    formatList(enabledCategories)
  );
  
  // Handle e-Gov section
  if (!config.eGovCrossReference && !settings.output.eGovCrossReference) {
    // Remove EGOV_SECTION
    prompt = prompt.replace(
      /EGOV_SECTION_BEGIN[\s\S]*?EGOV_SECTION_END/g,
      ''
    );
  } else {
    // Just remove the markers
    prompt = prompt.replace(/EGOV_SECTION_BEGIN\n?/g, '');
    prompt = prompt.replace(/EGOV_SECTION_END\n?/g, '');
  }
  
  // Handle proof section
  if (!config.proofMode) {
    // Remove PROOF_SECTION
    prompt = prompt.replace(
      /PROOF_SECTION_BEGIN[\s\S]*?PROOF_SECTION_END/g,
      ''
    );
  } else {
    // Just remove the markers
    prompt = prompt.replace(/PROOF_SECTION_BEGIN\n?/g, '');
    prompt = prompt.replace(/PROOF_SECTION_END\n?/g, '');
  }
  
  // Clean up multiple blank lines
  prompt = prompt.replace(/\n{3,}/g, '\n\n');
  
  return prompt.trim();
}

// ============================================================================
// Search Query Generation
// ============================================================================

export function generateSearchQueries(config: AppConfig, extSettings?: ExtendedSettings): string[] {
  const settings = extSettings || loadExtendedSettings();
  const queries: string[] = [];
  
  // 1. Query with 3省2ガイドライン
  queries.push(`3省2ガイドライン ${config.query || '医療AI'} ガイドライン 最新版`);
  
  // 2. Query with user's search theme
  if (config.query) {
    queries.push(`${config.query} ガイドライン 国内`);
  }
  
  // 3. Top 5 enabled keyword chips
  const enabledChips = config.keywordChips.filter(k => k.enabled).slice(0, 5);
  enabledChips.forEach(chip => {
    queries.push(chip.name);
  });
  
  // 4. Site-specific queries if site operator is enabled
  if (config.officialDomainPriority && settings.search.useSiteOperator) {
    const topDomains = config.priorityDomains.slice(0, 3);
    topDomains.forEach(domain => {
      queries.push(`site:${domain} ${config.query || '医療AI'} ガイドライン`);
    });
  }
  
  // 5. Filetype-specific queries if enabled
  if (settings.search.useFiletypeOperator && settings.search.filetypes.length > 0) {
    const filetypeQuery = settings.search.filetypes.map(ft => `filetype:${ft}`).join(' OR ');
    queries.push(`${config.query || '医療AI'} ガイドライン (${filetypeQuery})`);
  }
  
  // Limit to maxResults
  return queries.slice(0, Math.min(10, settings.search.maxResults));
}

// ============================================================================
// Config Serialization
// ============================================================================

export function configToJSON(config: AppConfig): string {
  return JSON.stringify(config, null, 2);
}

export function parseConfigJSON(json: string): AppConfig | null {
  try {
    const parsed = JSON.parse(json);
    // Basic validation
    if (typeof parsed === 'object' && parsed !== null && 'activeTab' in parsed) {
      return parsed as AppConfig;
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Share Link
// ============================================================================

export function encodeConfigToURL(config: AppConfig): string {
  try {
    const json = JSON.stringify(config);
    const encoded = btoa(encodeURIComponent(json));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?c=${encoded}`;
  } catch {
    return '';
  }
}

export function decodeConfigFromURL(url: string): AppConfig | null {
  try {
    const urlObj = new URL(url);
    const encoded = urlObj.searchParams.get('c');
    if (!encoded) return null;
    
    const json = decodeURIComponent(atob(encoded));
    return parseConfigJSON(json);
  } catch {
    return null;
  }
}

export function isShareLinkTooLong(config: AppConfig): boolean {
  const url = encodeConfigToURL(config);
  return url.length > 2000; // Most browsers support up to 2048 characters
}
