import { useState } from 'react'
import { ChevronDown, LifeBuoy, Send } from 'lucide-react'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { ScreenHeader } from '../../components/layout/ScreenHeader'
import { useApp } from '../../context/app-store'
import { useLanguage } from '../../context/language'
import { faqs } from '../../mock/support'
import { formatDate } from '../../utils/format'

export function SupportPage() {
  const { tickets, createTicket } = useApp()
  const { t, locale } = useLanguage()
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit() {
    if (subject.trim().length < 4) {
      setError('Add a short subject for your issue.')
      return
    }

    if (message.trim().length < 12) {
      setError('Describe the issue in a little more detail.')
      return
    }

    createTicket(subject.trim(), message.trim())
    setSubject('')
    setMessage('')
    setError('')
    setSent(true)
  }

  return (
    <div className="pb-8">
      <ScreenHeader
        title={t('Help & support')}
        subtitle={t('FAQs and support tickets')}
        showBack
        backTo="/"
      />

      <div className="space-y-4 px-4 pt-5">
        <Card padding="md">
          <p className="text-[13px] font-bold text-ink">
            {t('Frequently asked')}
          </p>

          <ul className="mt-2 divide-y divide-line">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.id

              return (
                <li key={faq.id} className="py-2.5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    <span className="text-[12.5px] font-semibold text-ink">
                      {t(faq.question)}
                    </span>
                    <ChevronDown
                      className={
                        isOpen
                          ? 'size-4 shrink-0 rotate-180 text-brand transition-transform'
                          : 'size-4 shrink-0 text-ink-soft transition-transform'
                      }
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen ? (
                    <p className="mt-1.5 pr-6 text-[11.5px] leading-relaxed text-ink-muted">
                      {t(faq.answer)}
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </Card>

        <Card padding="md" className="space-y-3">
          <div>
            <p className="text-[13px] font-bold text-ink">{t('Raise a ticket')}</p>
            <p className="text-[11.5px] text-ink-muted">
              {t('Our team replies within one working day.')}
            </p>
          </div>

          <Input
            label={t('Subject')}
            value={subject}
            placeholder={t('Short summary of the issue')}
            onChange={(event) => {
              setSubject(event.target.value)
              if (error) {
                setError('')
              }
              if (sent) {
                setSent(false)
              }
            }}
          />

          <div>
            <label
              htmlFor="ticket-message"
              className="mb-1.5 block text-[13px] font-semibold text-ink"
            >
              {t('Describe the issue')}
            </label>
            <textarea
              id="ticket-message"
              rows={4}
              value={message}
              placeholder={t('What happened, and when?')}
              onChange={(event) => {
                setMessage(event.target.value)
                if (error) {
                  setError('')
                }
                if (sent) {
                  setSent(false)
                }
              }}
              className="w-full resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors placeholder:font-normal placeholder:text-ink-soft hover:border-brand/30 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
            />
          </div>

          {error ? (
            <p role="alert" className="text-xs font-medium text-danger">
              {t(error)}
            </p>
          ) : null}

          {sent ? (
            <p className="rounded-xl bg-success-soft px-3 py-2 text-[11.5px] font-medium text-success">
              {t('Ticket created. You can track its status below.')}
            </p>
          ) : null}

          <Button
            fullWidth
            onClick={handleSubmit}
            leftIcon={<Send className="size-4" aria-hidden="true" />}
          >
            {t('Submit ticket')}
          </Button>
        </Card>

        <Card padding="md">
          <p className="text-[13px] font-bold text-ink">{t('Your tickets')}</p>

          {tickets.length > 0 ? (
            <ul className="mt-2 divide-y divide-line">
              {tickets.map((ticket) => (
                <li key={ticket.id} className="py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12.5px] font-semibold text-ink">
                      {ticket.subject}
                    </p>
                    <Badge
                      tone={ticket.status === 'Open' ? 'warning' : 'success'}
                      size="sm"
                    >
                      {t(ticket.status)}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink-soft">
                    {ticket.id} · {formatDate(ticket.createdAt, locale)}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
                    {ticket.message}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[11.5px] text-ink-muted">
              {t('You have not raised any tickets yet.')}
            </p>
          )}
        </Card>

        <p className="flex items-center justify-center gap-1.5 px-1 text-center text-[11px] text-ink-soft">
          <LifeBuoy className="size-3.5" aria-hidden="true" />
          {t('Emergency support: 1800 123 4567 (24×7)')}
        </p>
      </div>
    </div>
  )
}
