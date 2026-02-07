/**
 * Medical AI Prompt Builder - Zod Validation Schemas
 * Design: Medical Precision 2.0
 *
 * Provides runtime validation for:
 * - AppConfig (main application configuration)
 * - ExtendedSettings (template, search, output, UI settings)
 * - TabPreset (preset tab definitions)
 */

import { z } from 'zod';

// ============================================================================
// TabPreset Schema
// ============================================================================

export const TabPresetSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  categories: z.array(z.string()),
  keywordChips: z.array(z.string()),
});

export type ValidatedTabPreset = z.infer<typeof TabPresetSchema>;

// ============================================================================
// AppConfig Schema
// ============================================================================

const CategoryItemSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
});

const KeywordChipItemSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
});

export const DifficultyLevelSchema = z.enum(['standard', 'professional']);

export const AppConfigSchema = z.object({
  // Basic settings
  dateToday: z.string(),
  query: z.string(),
  scope: z.array(z.string()),
  audiences: z.array(z.string()),
  difficultyLevel: DifficultyLevelSchema.default('standard'),

  // Optional inputs (user-provided documents)
  vendorDocText: z.string().default(''),
  // Prevent "AI contract" vs "non-AI EHR contract" confusion.
  // Default keeps older saved configs/share links valid.
  aiInScope: z.enum(['unknown', 'yes', 'no']).default('unknown'),

  // Switches
  threeMinistryGuidelines: z.boolean(),
  officialDomainPriority: z.boolean(),
  siteOperator: z.boolean(),
  latestVersionPriority: z.boolean(),
  pdfDirectLink: z.boolean(),
  includeSearchLog: z.boolean(),
  eGovCrossReference: z.boolean(),
  proofMode: z.boolean(),

  // Categories (with order and enabled state)
  categories: z.array(CategoryItemSchema),

  // Keywords
  keywordChips: z.array(KeywordChipItemSchema),
  customKeywords: z.array(z.string()),
  excludeKeywords: z.array(z.string()),

  // Priority domains
  priorityDomains: z.array(z.string()),

  // Active tab
  activeTab: z.string(),
});

export type ValidatedAppConfig = z.infer<typeof AppConfigSchema>;

// ============================================================================
// ExtendedSettings Schema
// ============================================================================

const OutputSectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  order: z.number(),
});

const TemplateSettingsSchema = z.object({
  roleTitle: z.string(),
  roleDescription: z.string(),
  disclaimers: z.array(z.string()),
  outputSections: z.array(OutputSectionSchema),
  customInstructions: z.string(),
});

const SearchSettingsSchema = z.object({
  useSiteOperator: z.boolean(),
  useFiletypeOperator: z.boolean(),
  filetypes: z.array(z.string()),
  priorityRule: z.enum(['published_date', 'revised_date', 'relevance']),
  excludedDomains: z.array(z.string()),
  maxResults: z.number().min(1).max(100),
  recursiveDepth: z.number().min(0).max(10),
});

const OutputSettingsSchema = z.object({
  languageMode: z.enum(['japanese_only', 'mixed', 'english_priority']),
  includeEnglishTerms: z.boolean(),
  detailLevel: z.enum(['concise', 'standard', 'detailed']),
  eGovCrossReference: z.boolean(),
  includeLawExcerpts: z.boolean(),
  outputFormat: z.enum(['markdown', 'plain_text']),
  includeSearchLog: z.boolean(),
});

const UISettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  fontSize: z.enum(['small', 'medium', 'large']),
  defaultOutputTab: z.enum(['prompt', 'queries', 'json']),
  defaultPurposeTab: z.string(),
  compactMode: z.boolean(),
  showTooltips: z.boolean(),
  animationsEnabled: z.boolean(),
});

export const ExtendedSettingsSchema = z.object({
  template: TemplateSettingsSchema,
  search: SearchSettingsSchema,
  output: OutputSettingsSchema,
  ui: UISettingsSchema,
  version: z.number(),
  lastUpdated: z.string(),
});

export type ValidatedExtendedSettings = z.infer<typeof ExtendedSettingsSchema>;

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Safely parse and validate AppConfig JSON
 * Returns the validated config or null if invalid
 */
export function parseAppConfig(data: unknown): ValidatedAppConfig | null {
  const result = AppConfigSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.error('AppConfig validation failed:', result.error.issues);
  return null;
}

/**
 * Safely parse and validate ExtendedSettings JSON
 * Returns the validated settings or null if invalid
 */
export function parseExtendedSettings(data: unknown): ValidatedExtendedSettings | null {
  const result = ExtendedSettingsSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.error('ExtendedSettings validation failed:', result.error.issues);
  return null;
}

/**
 * Safely parse and validate TabPreset JSON
 * Returns the validated preset or null if invalid
 */
export function parseTabPreset(data: unknown): ValidatedTabPreset | null {
  const result = TabPresetSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.error('TabPreset validation failed:', result.error.issues);
  return null;
}

/**
 * Validate AppConfig and return detailed errors
 */
export function validateAppConfig(data: unknown): { success: boolean; data?: ValidatedAppConfig; errors?: z.ZodIssue[] } {
  const result = AppConfigSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.issues };
}

/**
 * Validate ExtendedSettings and return detailed errors
 */
export function validateExtendedSettings(data: unknown): { success: boolean; data?: ValidatedExtendedSettings; errors?: z.ZodIssue[] } {
  const result = ExtendedSettingsSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.issues };
}

/**
 * Validate TabPreset and return detailed errors
 */
export function validateTabPreset(data: unknown): { success: boolean; data?: ValidatedTabPreset; errors?: z.ZodIssue[] } {
  const result = TabPresetSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.issues };
}
