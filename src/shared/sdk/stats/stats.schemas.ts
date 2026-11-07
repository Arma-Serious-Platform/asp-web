'use client';

import { z } from 'zod';

/** Sparse players may get `null` or no value instead of an empty list. */
const listSchema = <T extends z.ZodTypeAny>(item: T) =>
  z
    .array(item)
    .nullish()
    .transform(items => items ?? []);

export const playerStatsSchema = z.object({
  name: z.string(),
  squad: z.string(),
  squadRaw: z.string(),
  kills: z.number(),
  deaths: z.number(),
  teamKills: z.number(),
  vehiclesDestroyed: z.number(),
  killAssists: z.number(),
  shotsFired: z.number(),
  hits: z.number(),
  treatments: z.number(),
  revives: z.number(),
  medicalPoints: z.number(),
  attendance: z.number(),
  accuracy: z.number(),
  kd: z.number(),
  firstSeen: z.string(),
  lastSeen: z.string(),
  custom: z.record(z.string(), z.number()).nullish(),
});
export type PlayerStats = z.infer<typeof playerStatsSchema>;

export const playerStatsTrendSchema = z.object({
  /** `YYYY-MM` */
  month: z.string(),
  missions: z.number(),
  kills: z.number(),
  deaths: z.number(),
  killAssists: z.number(),
  medicalPoints: z.number(),
  kd: z.number(),
});
export type PlayerStatsTrend = z.infer<typeof playerStatsTrendSchema>;

export const playerStatsMissionSchema = z.object({
  missionId: z.number(),
  filename: z.string(),
  date: z.string(),
  name: z.string(),
  world: z.string(),
  squad: z.string(),
  squadRaw: z.string(),
  side: z.string(),
  kills: z.number(),
  deaths: z.number(),
  teamKills: z.number(),
  vehiclesDestroyed: z.number(),
  killAssists: z.number(),
  shotsFired: z.number(),
  hits: z.number(),
  treatments: z.number(),
  revives: z.number(),
  medicalPoints: z.number(),
});
export type PlayerStatsMission = z.infer<typeof playerStatsMissionSchema>;

export const playerStatsCountSchema = z.object({
  name: z.string(),
  count: z.number(),
});
export type PlayerStatsCount = z.infer<typeof playerStatsCountSchema>;

export const playerStatsKillSchema = z.object({
  missionId: z.number(),
  date: z.string(),
  frame: z.number(),
  killer: z.string(),
  killerSquad: z.string(),
  killerSide: z.string(),
  killerIsPlayer: z.boolean(),
  victim: z.string(),
  victimSquad: z.string(),
  victimSide: z.string(),
  victimKind: z.string(),
  weapon: z.string(),
  distance: z.number(),
  teamKill: z.boolean(),
});
export type PlayerStatsKill = z.infer<typeof playerStatsKillSchema>;

export const playerStatsFilterSchema = z.object({
  from: z.string(),
  to: z.string(),
  tag: z.string(),
  minDuration: z.number(),
});
export type PlayerStatsFilter = z.infer<typeof playerStatsFilterSchema>;

export const playerStatsResponseSchema = z.object({
  filter: playerStatsFilterSchema,
  player: playerStatsSchema,
  trend: listSchema(playerStatsTrendSchema),
  missions: listSchema(playerStatsMissionSchema),
  killedBy: listSchema(playerStatsCountSchema),
  victims: listSchema(playerStatsCountSchema),
  weapons: listSchema(playerStatsCountSchema),
  squads: listSchema(playerStatsCountSchema),
  longestKill: playerStatsKillSchema.nullish(),
});
export type PlayerStatsResponse = z.infer<typeof playerStatsResponseSchema>;
