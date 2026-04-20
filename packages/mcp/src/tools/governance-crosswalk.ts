import {
  guidelines,
  type Cell,
  type Guideline,
} from '@cursorversinc/guidescope-medical-corpus';

type GovernanceCrosswalkArgs = {
  persona?: string;
  query?: string;
};

type GovernanceCrosswalkMatch = {
  guideline_name: string;
  column_id: string;
  column_name: string;
  strength: Cell['requirement'];
  summary: string;
  citation_url: string;
  confidence: NonNullable<Cell['citation']['confidence']>;
};

const COLUMN_NAMES: Record<string, string> = {
  A: '適用対象',
  B: 'リスク分類',
  C: '透明性',
  D: '監査ログ',
  E: 'Human oversight',
  F: 'データ品質バイアス',
  G: 'PCCP市販後',
  H: '責任',
  I: '同意プライバシー',
  J: 'セキュリティ',
  K: '臨床評価',
  L: '国際整合',
  M: 'ライフサイクル',
};

function getSummary(cell: Cell): string {
  return cell.summary_ja || ((cell as Cell & { summary?: string }).summary ?? '');
}

function getColumnName(cell: Cell): string {
  return COLUMN_NAMES[cell.column] ?? cell.column;
}

function normalizeQuery(query: unknown): string {
  if (typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('query required');
  }

  return query.trim().toLowerCase();
}

function matchesCell(guideline: Guideline, cell: Cell, keywords: string[]): boolean {
  const haystack = [
    getSummary(cell),
    getColumnName(cell),
    cell.column,
    guideline.name_ja,
    guideline.name_en,
  ]
    .join(' ')
    .toLowerCase();

  return keywords.some(keyword => haystack.includes(keyword));
}

export function governanceCrosswalkTool(args: GovernanceCrosswalkArgs) {
  const query = normalizeQuery(args.query);
  const keywords = query.split(/\s+/).filter(Boolean);
  const matches: GovernanceCrosswalkMatch[] = [];

  for (const guideline of guidelines) {
    for (const cell of guideline.cells) {
      if (!matchesCell(guideline, cell, keywords)) {
        continue;
      }

      matches.push({
        guideline_name: guideline.name_ja || guideline.name_en,
        column_id: cell.column,
        column_name: getColumnName(cell),
        strength: cell.requirement,
        summary: getSummary(cell),
        citation_url: cell.citation.url,
        confidence: cell.citation.confidence ?? 'low',
      });

      if (matches.length >= 10) {
        break;
      }
    }

    if (matches.length >= 10) {
      break;
    }
  }

  const result = {
    query,
    persona: args.persona,
    match_count: matches.length,
    matches,
  };

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
    structuredContent: result,
  };
}
