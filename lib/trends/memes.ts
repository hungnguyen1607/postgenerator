/**
 * Meme Generator using Imgflip API
 */

// Popular meme templates with their IDs
const MEME_TEMPLATES = [
  { id: '181913649', name: 'Drake Hotline Bling' },
  { id: '87743020', name: 'Two Buttons' },
  { id: '112126428', name: 'Distracted Boyfriend' },
  { id: '131087935', name: 'Running Away Balloon' },
  { id: '217743513', name: 'UNO Draw 25 Cards' },
  { id: '222403160', name: 'Bernie Sanders Again' },
  { id: '124822590', name: 'Left Exit 12 Off Ramp' },
  { id: '91538330', name: 'X X Everywhere' },
  { id: '102156234', name: 'Mocking Spongebob' },
  { id: '93895088', name: 'Expanding Brain' },
  { id: '247375501', name: 'Buff Doge vs Cheems' },
  { id: '252600902', name: 'Always Has Been' },
  { id: '188390779', name: 'Woman Yelling At Cat' },
  { id: '119139145', name: 'Blank Nut Button' },
  { id: '61579', name: 'One Does Not Simply' },
  { id: '101470', name: 'Ancient Aliens' },
  { id: '61520', name: 'Futurama Fry' },
  { id: '1035805', name: 'Boardroom Meeting' },
  { id: '4087833', name: 'Waiting Skeleton' },
  { id: '135256802', name: 'Epic Handshake' },
]

interface MemeResult {
  success: boolean
  data?: {
    url: string
    page_url: string
  }
  error_message?: string
}

/**
 * Generate captions for different meme formats
 */
function generateCaptions(template: string, topic: string): { text0: string; text1: string } {
  // Extract key parts of the topic
  const shortTopic = topic.length > 50 ? topic.slice(0, 50) + '...' : topic

  switch (template) {
    case 'Drake Hotline Bling':
      return {
        text0: 'Reading the news like a normal person',
        text1: `Panic scrolling about ${shortTopic}`,
      }
    case 'Distracted Boyfriend':
      return {
        text0: shortTopic,
        text1: 'My actual work',
      }
    case 'Two Buttons':
      return {
        text0: 'Ignore it',
        text1: `Overthink ${shortTopic}`,
      }
    case 'UNO Draw 25 Cards':
      return {
        text0: `Stay calm about ${shortTopic}`,
        text1: 'Draw 25',
      }
    case 'Left Exit 12 Off Ramp':
      return {
        text0: 'Staying productive',
        text1: `Doom scrolling ${shortTopic}`,
      }
    case 'Always Has Been':
      return {
        text0: `Wait, it's all ${shortTopic}?`,
        text1: 'Always has been',
      }
    case 'Woman Yelling At Cat':
      return {
        text0: `Everyone panicking about ${shortTopic}`,
        text1: 'Me just vibing',
      }
    case 'One Does Not Simply':
      return {
        text0: 'One does not simply',
        text1: `Ignore ${shortTopic}`,
      }
    case 'Futurama Fry':
      return {
        text0: `Not sure if ${shortTopic} is good`,
        text1: 'Or if I should panic',
      }
    case 'Epic Handshake':
      return {
        text0: 'Bulls',
        text1: 'Bears',
      }
    case 'Buff Doge vs Cheems':
      return {
        text0: `Me explaining ${shortTopic}`,
        text1: 'Me understanding it',
      }
    default:
      return {
        text0: shortTopic,
        text1: 'Me pretending to understand',
      }
  }
}

/**
 * Generate a meme using imgflip API
 */
export async function generateMeme(topic: string): Promise<string | null> {
  const username = process.env.IMGFLIP_USERNAME
  const password = process.env.IMGFLIP_PASSWORD

  if (!username || !password) {
    console.warn('Imgflip credentials not set')
    return null
  }

  // Pick random template
  const template = MEME_TEMPLATES[Math.floor(Math.random() * MEME_TEMPLATES.length)]
  const captions = generateCaptions(template.name, topic)

  try {
    const params = new URLSearchParams({
      template_id: template.id,
      username,
      password,
      text0: captions.text0,
      text1: captions.text1,
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

// Keep the old function name for compatibility
export async function fetchMeme(topic: string): Promise<string | null> {
  return generateMeme(topic)
}
