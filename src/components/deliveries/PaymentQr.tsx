import { QRCodeSVG } from 'qrcode.react'
import { useLanguage } from '../../context/language'
import { formatCurrency } from '../../utils/format'

export interface PaymentQrProps {
  upiId: string
  payeeName?: string
  /** Encoded into the UPI intent when the delivery collects cash. */
  amount?: number
  reference?: string
}

/**
 * UPI QR generated locally from the partner's payout UPI ID. The code is never
 * sent to a QR service; `upi://pay` is the standard intent scanned by UPI apps.
 */
export function PaymentQr({
  upiId,
  payeeName,
  amount,
  reference,
}: PaymentQrProps) {
  const { t, locale } = useLanguage()
  const params = new URLSearchParams({ pa: upiId, cu: 'INR' })

  if (payeeName) {
    params.set('pn', payeeName)
  }
  if (amount && amount > 0) {
    params.set('am', amount.toFixed(2))
  }
  if (reference) {
    params.set('tn', reference)
  }

  const value = `upi://pay?${params.toString()}`

  return (
    <div className="rounded-xl border border-line px-3 py-3">
      <p className="text-[10.5px] font-semibold text-ink-soft">
        {t('Your payment QR')}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <div className="shrink-0 rounded-lg bg-white p-2">
          <QRCodeSVG
            value={value}
            size={96}
            bgColor="#ffffff"
            fgColor="#1B1430"
            level="M"
            title={value}
          />
        </div>
        <div className="min-w-0">
          <p className="break-all text-[12px] font-semibold text-ink">
            {upiId}
          </p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-ink-muted">
            {t('Scan to pay this UPI ID')}
          </p>
          {amount && amount > 0 ? (
            <p className="mt-1 text-[10.5px] text-ink-muted">
              {t('Amount filled: {amount}', {
                amount: formatCurrency(amount, locale),
              })}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
