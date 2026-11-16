import { LandingClient } from '@/components/pages/Landing'
import { dhatuCount, getDhatu, getFeatured, getSubhashitas, verseOfDay } from '@/lib/data'

export const revalidate = 3600

export default async function Home() {
  const [gam, featured, total, subh] = await Promise.all([getDhatu('01.1137'), getFeatured(), dhatuCount(), getSubhashitas()])
  if (!gam) return <main className="wrap py-24"><h1 className="disp text-4xl font-extrabold">Run the seed script first.</h1><p className="mt-3">npm run seed</p></main>
  return <LandingClient gam={gam} tiles={featured.slice(0, 26).map((d) => ({ root: d.display, meaning_en: d.meaning_en || '', artha_sa: d.artha_sa || '', slug: d.slug }))} total={total} featuredCount={featured.length} verse={verseOfDay(subh)} />
}
