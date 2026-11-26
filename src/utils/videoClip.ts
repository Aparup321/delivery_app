/**
 * Training clips are stored XOR-scrambled in `public/training/*.bin`.
 *
 * Download managers such as IDM hook the browser and download anything that
 * looks like a media file (an `.mp4` URL, a `video/*` response, or an MP4
 * `ftyp` header). Serving the bytes as octet-stream with a `.bin` name and
 * scrambling them means there is no media URL or signature to detect; the
 * player rebuilds a `video/mp4` blob in memory instead.
 *
 * This is obfuscation, not encryption: the key ships in the bundle.
 */
const VIDEO_KEY = [0x1f, 0x8b, 0x4a, 0xd2, 0x77, 0x0c] as const

/** Decode a scrambled clip into a playable `video/mp4` blob. */
export function decodeTrainingClip(buffer: ArrayBuffer): Blob {
  const bytes = new Uint8Array(buffer)

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] ^= VIDEO_KEY[index % VIDEO_KEY.length]
  }

  return new Blob([bytes], { type: 'video/mp4' })
}
