import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { DocumentUploadTile } from './DocumentUploadTile'

export interface KycDocumentCardProps {
  title: string
  numberLabel?: string
  numberValue?: string
  numberPlaceholder?: string
  numberHint?: string
  inputMode?: 'numeric' | 'text'
  maxLength?: number
  autoCapitalize?: 'characters' | 'none'
  required?: boolean
  fileName: string
  fileHint: string
  fileError?: string
  onNumberChange?: (value: string) => void
  onFileChange: (file: File) => void
}

/** KYC row with an optional document number and its upload control. */
export function KycDocumentCard({
  title,
  numberLabel,
  numberValue,
  numberPlaceholder,
  numberHint,
  inputMode = 'text',
  maxLength,
  autoCapitalize = 'none',
  required = false,
  fileName,
  fileHint,
  fileError,
  onNumberChange,
  onFileChange,
}: KycDocumentCardProps) {
  const hasNumberField = Boolean(numberLabel && onNumberChange)

  return (
    <Card padding="md">
      <div className="flex items-start gap-3">
        {hasNumberField ? (
          <Input
            containerClassName="min-w-0 flex-1"
            label={numberLabel}
            required={required}
            inputMode={inputMode}
            autoComplete="off"
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            value={numberValue ?? ''}
            placeholder={numberPlaceholder}
            hint={numberHint}
            onChange={(event) => onNumberChange?.(event.target.value)}
          />
        ) : (
          <p className="min-w-0 flex-1 self-center text-[13px] font-semibold text-ink">
            {title}
          </p>
        )}

        <DocumentUploadTile
          className={hasNumberField ? 'mt-[26px]' : 'self-center'}
          documentName={title}
          fileName={fileName}
          onFileChange={onFileChange}
        />
      </div>

      <p className="mt-2 break-words text-[11px] leading-relaxed text-ink-muted">
        {fileName || fileHint}
      </p>

      {fileError ? (
        <p role="alert" className="mt-2 text-[11px] font-medium text-danger">
          {fileError}
        </p>
      ) : null}
    </Card>
  )
}
