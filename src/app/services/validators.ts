/**
 * Phase 3: Zod validation schemas for API responses
 * Ensures runtime safety for external RapidAPI and Supabase edge data
 */
import { z } from 'zod';

// Live match API - flexible schema to handle multiple provider formats
export const LiveMatchApiSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  match_id: z.union([z.string(), z.number()]).optional(),
  homeTeam: z.union([z.string(), z.object({ name: z.string().optional(), logo: z.string().optional() })]).optional(),
  awayTeam: z.union([z.string(), z.object({ name: z.string().optional(), logo: z.string().optional() })]).optional(),
  home: z.union([z.string(), z.object({ name: z.string().optional(), score: z.union([z.string(), z.number()]).optional() })]).optional(),
  away: z.union([z.string(), z.object({ name: z.string().optional(), score: z.union([z.string(), z.number()]).optional() })]).optional(),
  league: z.union([z.string(), z.object({ name: z.string().optional(), logo: z.string().optional() })]).optional(),
  tournament: z.string().optional(),
  status: z.union([z.string(), z.object({}).passthrough()]).optional(),
  state: z.object({ description: z.string().optional(), score: z.object({ current: z.string().optional() }).optional(), clock: z.union([z.string(), z.number()]).optional() }).passthrough().optional(),
  home_score: z.union([z.string(), z.number()]).optional(),
  away_score: z.union([z.string(), z.number()]).optional(),
}).passthrough();

export const LiveMatchesResponseSchema = z.union([
  z.array(LiveMatchApiSchema),
  z.object({ data: z.array(LiveMatchApiSchema) }).passthrough(),
  z.object({ matches: z.array(LiveMatchApiSchema) }).passthrough(),
  z.object({ response: z.object({ live: z.array(LiveMatchApiSchema) }).passthrough() }).passthrough(),
  z.object({ response: z.array(LiveMatchApiSchema) }).passthrough(),
]);

// Prediction API
export const PredictionApiSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  home_name: z.string().optional(),
  away_name: z.string().optional(),
  home_team: z.string().optional(),
  away_team: z.string().optional(),
  probability: z.union([z.string(), z.number()]).optional(),
  odds: z.union([z.string(), z.number()]).optional(),
  avg_odds: z.union([z.string(), z.number()]).optional(),
}).passthrough();

// Contact form
export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject required').max(50),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

// Payment reference
export const PaystackRefSchema = z.string().min(5, 'Invalid reference').max(100).regex(/^[A-Za-z0-9_\-]+$/, 'Invalid reference format');

// User plan
export const UserPlanSchema = z.object({
  plan: z.enum(['free', 'premium', 'pro']),
  plan_expires_at: z.string().nullable().optional(),
});

// Validate helpers
export function validateLiveMatches(data: unknown) {
  try {
    return { success: true as const, data: LiveMatchesResponseSchema.parse(data) };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false as const, error: e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ') };
    }
    return { success: false as const, error: 'Unknown validation error' };
  }
}

export function validateContactForm(data: unknown) {
  try {
    return { success: true as const, data: ContactFormSchema.parse(data) };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false as const, error: e.errors[0]?.message || 'Validation failed', details: e.errors };
    }
    return { success: false as const, error: 'Validation failed' };
  }
}
