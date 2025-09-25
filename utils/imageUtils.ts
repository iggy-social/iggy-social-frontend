export async function resizeImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  maxSize = 1024 * 1024 // 1 MB
): Promise<File> {
  return new Promise((resolve, reject) => {
    const supported = ['image/jpeg', 'image/png', 'image/webp']
    if (!supported.includes(file.type)) {
      return reject(new Error('Unsupported file type. Only JPG, PNG, WebP allowed.'))
    }

    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      if (!e.target?.result) return reject(new Error('File load failed'))
      img.src = e.target.result as string
    }

    img.onload = () => {
      let { width, height } = img

      // maintain aspect ratio while shrinking dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas not supported'))

      ctx.drawImage(img, 0, 0, width, height)

      // Decide target format
      let mimeType = file.type
      if (mimeType === 'image/png') {
        // Convert PNG to JPEG if needed for smaller size
        mimeType = 'image/jpeg'
      }

      let quality = 0.9

      const tryExport = (): void => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Canvas export failed'))

            // If still too big, reduce quality (only works for JPEG/WebP)
            if (blob.size > maxSize && (mimeType === 'image/jpeg' || mimeType === 'image/webp')) {
              if (quality > 0.3) {
                quality -= 0.1
                return tryExport()
              }
            }

            // Done → return new File
            resolve(
              new File([blob], replaceExtension(file.name, mimeType), { type: mimeType })
            )
          },
          mimeType,
          quality
        )
      }

      tryExport()
    }

    img.onerror = () => reject(new Error('Image load failed'))
    reader.readAsDataURL(file)
  })
}

// Helper: replace old extension with new one based on mimeType
function replaceExtension(filename: string, mimeType: string): string {
  const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1]
  return filename.replace(/\.[^/.]+$/, '') + '.' + ext
}
