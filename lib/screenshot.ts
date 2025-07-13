import { toPng, toBlob } from 'html-to-image'

export interface ScreenshotOptions {
  filename?: string
  scale?: number
}

export async function generateScreenshotDataUrl(
  element: HTMLElement
): Promise<string> {
  // Force a reflow to ensure all content is rendered
  element.style.display = 'block'
  void element.offsetHeight // Force reflow
  
  // Longer delay to ensure fonts and content are fully rendered
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return await toPng(element, {
    quality: 1.0,
    pixelRatio: 2, // High DPI for better quality
    backgroundColor: '#0f0f0f', // Dark background to match card
    cacheBust: true
  })
}

export async function downloadScreenshot(
  element: HTMLElement,
  filename: string
): Promise<void> {
  try {
    const dataUrl = await generateScreenshotDataUrl(element)
    
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Failed to download screenshot:', error)
    throw error
  }
}

export async function copyScreenshotToClipboard(
  element: HTMLElement
): Promise<void> {
  try {
    const blob = await toBlob(element, {
      quality: 1.0,
      pixelRatio: 2, // High DPI for better quality
      backgroundColor: '#0f0f0f', // Dark background to match card
      cacheBust: true
    })
    
    if (!blob) throw new Error('Failed to generate blob')
    
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
  } catch (error) {
    console.error('Failed to copy screenshot to clipboard:', error)
    throw error
  }
}