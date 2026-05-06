// Zod body schemas for the /api/admin/images endpoints.
//
// POST is multipart and is parsed in the route handler directly (the file
// part is not JSON, so Zod only sees post-parse fields). PATCH is JSON
// and uses patchImageBodySchema.

import { z } from 'zod'

export const patchImageBodySchema = z.object({
  alt:     z.string().max(2000).optional(),
  focal_x: z.number().min(0).max(1).optional(),
  focal_y: z.number().min(0).max(1).optional(),
}).strict()

export type PatchImageBody = z.infer<typeof patchImageBodySchema>
