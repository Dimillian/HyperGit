import html2canvas from 'html2canvas'

export interface ScreenshotOptions {
  filename?: string
  scale?: number
}

export async function generateScreenshot(
  element: HTMLElement
): Promise<HTMLCanvasElement> {
  // Force a reflow to ensure all content is rendered
  element.style.display = 'block'
  void element.offsetHeight // Force reflow
  
  // Longer delay to ensure fonts and content are fully rendered
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Get accurate dimensions - add minimal buffer for text descenders
  const rect = element.getBoundingClientRect()
  const computedHeight = Math.max(element.offsetHeight, element.scrollHeight, rect.height)
  
  return await html2canvas(element, {
    useCORS: true,
    allowTaint: true,
    logging: false,
    width: element.offsetWidth,
    height: computedHeight + 15, // Buffer for text descenders and padding
    background: '#0f0f0f' // Dark background to match card
  })
}

export async function downloadScreenshot(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const canvas = await generateScreenshot(element)
  
  canvas.toBlob((blob) => {
    if (!blob) return
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 'image/png', 1.0)
}

export async function copyScreenshotToClipboard(
  element: HTMLElement
): Promise<void> {
  const canvas = await generateScreenshot(element)
  
  canvas.toBlob(async (blob) => {
    if (!blob) return
    
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
    } catch (error) {
      console.error('Failed to copy screenshot to clipboard:', error)
      throw error
    }
  }, 'image/png', 1.0)
}