/**
 * Meme Generator using Imgflip API
 */

// Map template names to imgflip IDs
const TEMPLATE_IDS: Record<string, string> = {
  'drake': '181913649',
  'drake hotline bling': '181913649',
  'distracted boyfriend': '112126428',
  'two buttons': '87743020',
  'uno draw 25': '217743513',
  'uno draw 25 cards': '217743513',
  'expanding brain': '93895088',
  'woman yelling at cat': '188390779',
  'always has been': '252600902',
  'one does not simply': '61579',
  'change my mind': '129242436',
  'this is fine': '55311130',
  'left exit 12': '124822590',
  'left exit 12 off ramp': '124822590',
  'buff doge vs cheems': '247375501',
  'epic handshake': '135256802',
  'futurama fry': '61520',
  'boardroom meeting': '1035805',
  'waiting skeleton': '4087833',
  'bernie sanders': '222403160',
  'running away balloon': '131087935',
  'mocking spongebob': '102156234',
  'is this a pigeon': '100777631',
  'surprised pikachu': '155067746',
  'hide the pain harold': '27920420',
  'roll safe': '89370399',
}

interface MemeResult {
  success: boolean
  data?: {
    url: string
    page_url: string
  }
  error_message?: string
}

/**
 * Find the best matching template ID
 */
function findTemplateId(templateName: string): string {
  const normalized = templateName.toLowerCase().trim()

  // Direct match
  if (TEMPLATE_IDS[normalized]) {
    return TEMPLATE_IDS[normalized]
  }

  // Partial match
  for (const [name, id] of Object.entries(TEMPLATE_IDS)) {
    if (normalized.includes(name) || name.includes(normalized)) {
      return id
    }
  }

  // Default to Drake
  return '181913649'
}

/**
 * Generate a meme with specific captions
 */
export async function generateMemeFromCaptions(
  templateName: string,
  topText: string,
  bottomText: string
): Promise<string | null> {
  const username = process.env.IMGFLIP_USERNAME
  const password = process.env.IMGFLIP_PASSWORD

  if (!username || !password) {
    console.warn('Imgflip credentials not set')
    return null
  }

  const templateId = findTemplateId(templateName)

  try {
    const params = new URLSearchParams({
      template_id: templateId,
      username,
      password,
      text0: topText,
      text1: bottomText,
    })

    const response = await fetch('https://api.imgflip.com/caption_image', {
      method: 'POST',
      body: params,
    })

    if (!response.ok) return null

    const data: MemeResult = await response.json()

    if (data.success && data.data?.url) {
      return data.data.url
    }

    console.error('Imgflip error:', data.error_message)
    return null
  } catch (error) {
    console.error('Meme generation error:', error)
    return null
  }
}
