/** After an edit in the CMS, refresh the public pages (skipped during bulk seeding). */
export const revalidateSite = async ({ doc, req }: { doc: any; req: { context?: Record<string, unknown> } }) => {
  if (req?.context?.skipRevalidate) return doc
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    /* not running inside Next.js (e.g. a script) */
  }
  return doc
}
