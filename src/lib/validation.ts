import { z } from 'zod';
import { COMPANY_SIZES, PITCH_CHANNELS } from '@/config/countries';

const nonEmpty = (max: number) => z.string().trim().min(1).max(max);

export const leadSchema = z.object({
  companyName: nonEmpty(160),
  companyWebsite: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v : null)),
  companySize: z
    .enum(COMPANY_SIZES.map((s) => s.value) as [string, ...string[]])
    .optional()
    .transform((v) => v ?? null),
  country: nonEmpty(80),
  timezone: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v ? v : null)),
  contactName: nonEmpty(120),
  contactRole: nonEmpty(120),
  contactRelationship: nonEmpty(200),
  contactEmail: z.string().trim().toLowerCase().email().max(200),
  // Optional and incentivized: a verified number that attends earns a bonus.
  contactPhone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v ? v : null)),
  pitchChannel: z.enum(
    PITCH_CHANNELS.map((c) => c.value) as [string, ...string[]],
  ),
});

export type LeadInput = z.infer<typeof leadSchema>;
