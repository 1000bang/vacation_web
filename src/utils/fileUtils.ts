/**
 * Content-Disposition 헤더에서 파일명 추출
 */
export const getFilenameFromResponse = (response: any, defaultFilename: string): string => {
  try {
    const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition']
    if (contentDisposition) {
      // Content-Disposition: attachment; filename="vacation_application_20260106.docx"
      // 또는 Content-Disposition: attachment; filename*=UTF-8''vacation_application_20260106.docx
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        let filename = filenameMatch[1].replace(/['"]/g, '')
        // URL 인코딩된 파일명 디코딩
        try {
          filename = decodeURIComponent(filename)
        } catch {
          // 디코딩 실패 시 그대로 사용
        }
        return filename
      }
    }
  } catch (error) {
    console.warn('파일명 추출 실패:', error)
  }
  return defaultFilename
}

