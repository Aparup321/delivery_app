import { Check, Upload } from 'lucide-react'
import { useLanguage } from '../../context/language'
import { cn } from '../../utils/cn'

export interface DocumentUploadTileProps {
  /** Translated document name used for the file input's accessible label. */
  documentName: string
  fileName: string
  onFileChange: (file: File) => void
  className?: string
}

/** Compact upload control shown to the right of a document number field. */
export function DocumentUploadTile({
  documentName,
  fileName,
  onFileChange,
  className,
}: DocumentUploadTileProps) {
  const { t } = useLanguage()

  return (
    <label
      className={cn(
        'flex w-[104px] shrink-0 cursor-pointer flex-col items-center gap-1 rounded-2xl border border-dashed border-brand/35 bg-brand-soft/60 px-2 py-2.5 text-center transition-colors hover:border-brand/60 hover:bg-brand-soft focus-within:ring-4 focus-within:ring-brand/10',
        className,
      )}
    >
      <span
        className={cn(
          'grid size-7 place-items-center rounded-lg',
          fileName ? 'bg-success text-white' : 'bg-surface text-brand-deep',
        )}
      >
        {fileName ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Upload className="size-4" aria-hidden="true" />
        )}
      </span>
      <span className="text-[11px] font-semibold text-brand-deep">
        {fileName ? t('Change') : t('Upload')}
      </span>
      <span className="text-[10.5px] leading-snug text-ink-muted">
        {t('JPG / PDF')}
      </span>
      <input
        type="file"
        accept="image/*,.pdf"
        aria-label={t('Upload {document}', { document: documentName })}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''

          if (file) {
            onFileChange(file)
          }
        }}
      />
    </label>
  )
}
