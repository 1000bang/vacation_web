/**
 * Blob 다운로드 응답에서 파일명 추출 및 { blob, filename } 반환
 * Content-Disposition 파싱, 없으면 defaultFilename 사용
 */
export function parseBlobDownload(
  response: { data: Blob; headers?: Record<string, unknown> },
  defaultFilename: string
): { blob: Blob; filename: string } {
  const h = (response.headers || {}) as Record<string, string>
  const contentDisposition = h['content-disposition'] || h['Content-Disposition'] || ''
  let filename = defaultFilename
  if (contentDisposition) {
    const m = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
    if (m?.[1]) {
      try {
        filename = decodeURIComponent(m[1].replace(/['"]/g, ''))
      } catch {
        filename = m[1].replace(/['"]/g, '')
      }
    }
  }
  return { blob: response.data, filename }
}
