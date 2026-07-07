/** Tenant scope for all finance data queries. */
export function scopedByUser<const W extends Record<string, unknown>>(
  userId: string,
  where?: W,
): W & { userId: string } {
  return {
    ...where,
    userId,
  } as W & { userId: string };
}

/** Row lookup / mutation guard — always pair id with userId. */
export function scopedId(userId: string, id: string) {
  return { id, userId };
}
