import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { DocumentUploadTile } from './DocumentUploadTile'

export interface KycDocumentCardProps {
  title: string
  numberLabel: string
  numberValue: string
  numberPlaceholder: string
  numberHint: string
  inputMode?: 'numeric' | 'text'
  maxLength: number
  autoCapitalize?: 'characters' | 'none'
  required?: boolean
  fileName: string
  fileHint: string
  fileError?: string
  onNumberChange: (value: string) => void
  onFileChange: (file: File) => void
}

/** KYC row with the document number on the left and upload control on the right. */
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
  return (
    <Card padding="md">
      <div className="flex items-start gap-3">
        <Input
          containerClassName="min-w-0 flex-1"
          label={numberLabel}
          required={required}
          inputMode={inputMode}
          autoComplete="off"
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          value={numberValue}
          placeholder={numberPlaceholder}
          hint={numberHint}
          onChange={(event) => onNumberChange(event.target.value)}
        />

        <DocumentUploadTile
          className="mt-[26px]"
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
