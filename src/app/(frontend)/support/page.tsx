import { metaFor } from '@/lib/seo'
import QRCode from 'qrcode'
import { SupportClient } from '@/components/pages/Support'

export const generateMetadata = ({ params }: { params?: Promise<{ lang?: string }> }) => metaFor('support', params)

/**
 * Payment options come from environment variables, so nothing is hard-coded:
 *   NEXT_PUBLIC_UPI_ID       e.g. name@okhdfcbank   → UPI button + QR code
 *   NEXT_PUBLIC_UPI_NAME     payee name shown in the UPI app
 *   NEXT_PUBLIC_SUPPORT_URL  any page (GitHub Sponsors, Razorpay, Ko-fi…) → "Chip in" button
 */
export default async function SupportPage() {
  const upi = process.env.NEXT_PUBLIC_UPI_ID || ''
  const name = process.env.NEXT_PUBLIC_UPI_NAME || 'Samvadasi'
  const link = upi ? `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(name)}&cu=INR&tn=${encodeURIComponent('Samvadasi')}` : ''
  const qr = link ? await QRCode.toString(link, { type: 'svg', margin: 0, color: { dark: '#24211D', light: '#00000000' } }) : ''
  return <SupportClient upi={upi} upiLink={link} qr={qr} url={process.env.NEXT_PUBLIC_SUPPORT_URL || ''} />
}
