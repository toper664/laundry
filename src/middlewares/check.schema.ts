import { z } from 'zod';

const typeSchema = z.object({
  type: z.string(),
  sub: z.string().optional(),
});

export const userSchema = typeSchema.extend({
  type: z.literal('user'),
  sub: z.number(),
  username: z.string().min(3),
});

export type UserInfo = z.infer<typeof userSchema>;

export const deviceSchema = typeSchema.extend({
  type: z.literal('device'),
  sub: z.uuidv7(),
  name: z.string().min(3),
});

export type DeviceInfo = z.infer<typeof deviceSchema>;

export const identitySchema = z.discriminatedUnion("type", [
  userSchema,
  deviceSchema
]);

export type Identity = z.infer<typeof identitySchema>;