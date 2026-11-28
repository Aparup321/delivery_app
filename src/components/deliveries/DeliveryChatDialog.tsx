import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { MessageCircle, Send, X } from 'lucide-react'
import { Button } from '../common/Button'
import { IconButton } from '../common/IconButton'
import { Input } from '../common/Input'
import { useLanguage } from '../../context/language'
import { useModalFocus } from '../../hooks/useModalFocus'
import { MAX_MESSAGE_LENGTH } from '../../services/deliveryMessages'
import type { Delivery } from '../../types/delivery'
import type { DeliveryMessage } from '../../types/message'
import { formatTime } from '../../utils/format'

export interface DeliveryChatDialogProps {
  delivery: Delivery
  messages: DeliveryMessage[]
  isSending: boolean
  error: string
  isLive: boolean
  onSend: (text: string) => Promise<boolean>
  onClose: () => void
}

/**
 * In-app chat with the customer for one delivery. Messages live in
 * `deliveries/{id}/messages`, so the grocery/restaurant customer apps can read
 * and reply to the same thread instead of exposing phone numbers.
 */
export function DeliveryChatDialog({
  delivery,
  messages,
  isSending,
  error,
  isLive,
  onSend,
  onClose,
}: DeliveryChatDialogProps) {
  const { t, locale } = useLanguage()
  const dialogRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState('')
  useModalFocus(dialogRef, onClose)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()

    if (!text || isSending) {
      return
    }

    const sent = await onSend(text)

    if (sent) {
      setDraft('')
    }
  }

  return createPortal(
    <div
      className="overlay-enter fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-3"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delivery-chat-title"
        className="dialog-enter flex max-h-[88dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-2xl bg-surface shadow-float"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <h2
              id="delivery-chat-title"
              className="text-[15px] font-bold tracking-tight text-ink"
            >
              {delivery.customerName}
            </h2>
            <p className="text-[11px] text-ink-muted">
              {delivery.id} · {t('In-app messages')}
            </p>
          </div>
          <IconButton
            label={t('Close')}
            variant="ghost"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </IconButton>
        </div>

        <div
          className="min-h-[220px] flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-3"
          role="log"
          aria-live="polite"
          aria-label={t('Messages with the customer')}
        >
          {messages.length === 0 ? (
            <div className="grid h-full min-h-[180px] place-items-center px-6 text-center">
              <div>
                <span className="mx-auto grid size-11 place-items-center rounded-full bg-brand-soft text-brand-deep">
                  <MessageCircle className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-2 text-[12.5px] font-semibold text-ink">
                  {t('No messages yet')}
                </p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
                  {t(
                    'Send an update about the pickup, the route or the handover.',
                  )}
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const fromPartner = message.sender === 'partner'

              return (
                <div
                  key={message.id}
                  className={
                    fromPartner
                      ? 'ml-auto max-w-[84%] text-right'
                      : 'mr-auto max-w-[84%] text-left'
                  }
                >
                  <div
                    className={
                      fromPartner
                        ? 'rounded-2xl rounded-br-md bg-brand px-3 py-2 text-left text-[12.5px] leading-relaxed text-white'
                        : 'rounded-2xl rounded-bl-md border border-line bg-canvas px-3 py-2 text-left text-[12.5px] leading-relaxed text-ink'
                    }
                  >
                    {message.text}
                  </div>
                  <p className="mt-0.5 text-[10px] text-ink-soft">
                    {fromPartner ? t('You') : delivery.customerName} ·{' '}
                    {formatTime(message.createdAt, locale)}
                  </p>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {!isLive ? (
          <p className="border-t border-line bg-canvas px-4 py-2 text-[10.5px] leading-relaxed text-ink-muted">
            {t('Demo build: only your messages are shown.')}
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="border-t border-line bg-danger-soft px-4 py-2 text-[11px] font-medium text-danger"
          >
            {t(error)}
          </p>
        ) : null}

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex items-end gap-2 border-t border-line px-3 py-3"
        >
          <Input
            containerClassName="min-w-0 flex-1"
            label={t('Message')}
            placeholder={t('Type a message…')}
            value={draft}
            maxLength={MAX_MESSAGE_LENGTH}
            autoComplete="off"
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button
            type="submit"
            size="sm"
            className="mb-[26px] shrink-0"
            disabled={!draft.trim() || isSending}
            isLoading={isSending}
            leftIcon={<Send className="size-3.5" aria-hidden="true" />}
          >
            {t('Send')}
          </Button>
        </form>
      </div>
    </div>,
    document.body,
  )
}
