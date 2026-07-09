#!/usr/bin/env node

// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import {
  generate,
  generatePrompt,
  generateSearchQueries,
  TAB_PRESETS,
  DIFFICULTY_PRESETS
} from "@cursorversinc/guidescope";

// src/tools/governance-crosswalk.ts
import {
  guidelines
} from "@cursorversinc/guidescope-medical-corpus";
var COLUMN_NAMES = {
  A: "\u9069\u7528\u5BFE\u8C61",
  B: "\u30EA\u30B9\u30AF\u5206\u985E",
  C: "\u900F\u660E\u6027",
  D: "\u76E3\u67FB\u30ED\u30B0",
  E: "Human oversight",
  F: "\u30C7\u30FC\u30BF\u54C1\u8CEA\u30D0\u30A4\u30A2\u30B9",
  G: "PCCP\u5E02\u8CA9\u5F8C",
  H: "\u8CAC\u4EFB",
  I: "\u540C\u610F\u30D7\u30E9\u30A4\u30D0\u30B7\u30FC",
  J: "\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3",
  K: "\u81E8\u5E8A\u8A55\u4FA1",
  L: "\u56FD\u969B\u6574\u5408",
  M: "\u30E9\u30A4\u30D5\u30B5\u30A4\u30AF\u30EB"
};
function getSummary(cell) {
  return cell.summary_ja || (cell.summary ?? "");
}
function getColumnName(cell) {
  return COLUMN_NAMES[cell.column] ?? cell.column;
}
function normalizeQuery(query) {
  if (typeof query !== "string" || query.trim().length === 0) {
    throw new Error("query required");
  }
  return query.trim().toLowerCase();
}
function matchesCell(guideline, cell, keywords) {
  const haystack = [
    getSummary(cell),
    getColumnName(cell),
    cell.column,
    guideline.name_ja,
    guideline.name_en
  ].join(" ").toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword));
}
function governanceCrosswalkTool(args) {
  const query = normalizeQuery(args.query);
  const keywords = query.split(/\s+/).filter(Boolean);
  const matches = [];
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
        confidence: cell.citation.confidence ?? "low"
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
    matches
  };
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2)
      }
    ],
    structuredContent: result
  };
}

// src/index.ts
var server = new Server(
  {
    name: "guidescope",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate",
        description: "\u533B\u7642AI\u30AC\u30A4\u30C9\u30E9\u30A4\u30F3\u691C\u7D22\u7528\u306E\u30D7\u30ED\u30F3\u30D7\u30C8\u3068\u691C\u7D22\u30AF\u30A8\u30EA\u3092\u751F\u6210\u3057\u307E\u3059",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "\u63A2\u7D22\u30C6\u30FC\u30DE\uFF08\u4F8B\uFF1A\u533B\u7642AI\u306E\u81E8\u5E8A\u5C0E\u5165\u306B\u304A\u3051\u308B\u5B89\u5168\u7BA1\u7406\uFF09"
            },
            preset: {
              type: "string",
              description: "\u30D7\u30EA\u30BB\u30C3\u30C8: medical-device, clinical-operation, research-ethics, generative-ai",
              enum: TAB_PRESETS.map((p) => p.id)
            },
            difficulty: {
              type: "string",
              description: "\u96E3\u6613\u5EA6: standard\uFF08\u57FA\u672C\uFF09, professional\uFF08\u8A73\u7D30\u5206\u6790\uFF09",
              enum: DIFFICULTY_PRESETS.map((p) => p.id)
            },
            customKeywords: {
              type: "array",
              items: { type: "string" },
              description: "\u8FFD\u52A0\u306E\u691C\u7D22\u30AD\u30FC\u30EF\u30FC\u30C9"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "generatePrompt",
        description: "\u533B\u7642AI\u30AC\u30A4\u30C9\u30E9\u30A4\u30F3\u691C\u7D22\u7528\u306E\u30D7\u30ED\u30F3\u30D7\u30C8\u306E\u307F\u3092\u751F\u6210\u3057\u307E\u3059",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "\u63A2\u7D22\u30C6\u30FC\u30DE"
            },
            preset: {
              type: "string",
              description: "\u30D7\u30EA\u30BB\u30C3\u30C8",
              enum: TAB_PRESETS.map((p) => p.id)
            },
            difficulty: {
              type: "string",
              description: "\u96E3\u6613\u5EA6",
              enum: DIFFICULTY_PRESETS.map((p) => p.id)
            }
          },
          required: ["query"]
        }
      },
      {
        name: "generateSearchQueries",
        description: "\u533B\u7642AI\u30AC\u30A4\u30C9\u30E9\u30A4\u30F3\u691C\u7D22\u7528\u306E\u30AF\u30A8\u30EA\u4E00\u89A7\u3092\u751F\u6210\u3057\u307E\u3059",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "\u63A2\u7D22\u30C6\u30FC\u30DE"
            },
            preset: {
              type: "string",
              description: "\u30D7\u30EA\u30BB\u30C3\u30C8",
              enum: TAB_PRESETS.map((p) => p.id)
            }
          },
          required: ["query"]
        }
      },
      {
        name: "listPresets",
        description: "\u5229\u7528\u53EF\u80FD\u306A\u30D7\u30EA\u30BB\u30C3\u30C8\u4E00\u89A7\u3092\u8868\u793A\u3057\u307E\u3059",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "query_governance_crosswalk",
        description: "Search the medical AI governance crosswalk (10 public guidelines \xD7 13 governance columns) for cells matching a clinical query. Returns guideline citations, requirement strength (must/should/mention), and source URLs.",
        inputSchema: {
          type: "object",
          properties: {
            persona: {
              type: "string",
              description: "Optional user persona or clinical role context"
            },
            query: {
              type: "string",
              description: "Clinical query or governance keyword to match against crosswalk cells"
            }
          },
          required: ["query"]
        }
      }
    ]
  };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case "generate": {
        const options = {
          query: args?.query,
          preset: args?.preset,
          difficulty: args?.difficulty,
          customKeywords: args?.customKeywords
        };
        const result = generate(options);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                prompt: result.prompt,
                searchQueries: result.searchQueries
              }, null, 2)
            }
          ]
        };
      }
      case "generatePrompt": {
        const options = {
          query: args?.query,
          preset: args?.preset,
          difficulty: args?.difficulty
        };
        const prompt = generatePrompt(options);
        return {
          content: [
            {
              type: "text",
              text: prompt
            }
          ]
        };
      }
      case "generateSearchQueries": {
        const options = {
          query: args?.query,
          preset: args?.preset
        };
        const queries = generateSearchQueries(options);
        return {
          content: [
            {
              type: "text",
              text: queries.join("\n")
            }
          ]
        };
      }
      case "listPresets": {
        const presets = TAB_PRESETS.map((p) => ({
          id: p.id,
          name: p.name,
          categories: p.categories
        }));
        const difficulties = DIFFICULTY_PRESETS.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          features: p.features
        }));
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ presets, difficulties }, null, 2)
            }
          ]
        };
      }
      case "query_governance_crosswalk": {
        return governanceCrosswalkTool({
          persona: args?.persona,
          query: args?.query
        });
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
});
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GuideScope MCP server running on stdio");
}
main().catch(console.error);
//# sourceMappingURL=index.js.map