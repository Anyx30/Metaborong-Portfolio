// Re-exports the AI-readiness wire types so callers can keep imports
// scoped to lib/ai-readiness/* without reaching back into lib/blog-schema.
//
// The schemas themselves live in lib/blog-schema.ts because Frontend
// imports from there (single source of truth — see agent-prompts.md §2.4).

export type {
  AiReadinessReport,
  AiReadinessCheck,
  AiReadinessCheckId,
  AiReadinessCheckScope,
  AiReadinessCheckStatus,
  AiReadinessMetadata,
  AiReadinessBand,
} from '../blog-schema'

export {
  aiReadinessReportSchema,
  aiReadinessCheckSchema,
  aiReadinessBandSchema,
} from '../blog-schema'
