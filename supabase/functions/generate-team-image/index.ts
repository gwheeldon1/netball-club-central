
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, type, teamName } = await req.json()
    
    if (!prompt || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: prompt and type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Enhanced prompts based on type
    let enhancedPrompt = ''
    if (type === 'avatar') {
      enhancedPrompt = `Create a clean, professional sports team logo for "${teamName}". ${prompt}. Style: modern, bold, simple design suitable for a team avatar. High contrast, clear shapes, suitable for small sizes. Vector-style illustration.`
    } else if (type === 'banner') {
      enhancedPrompt = `Create a dynamic sports team banner image for "${teamName}". ${prompt}. Style: wide banner format, energetic, professional sports photography or illustration style. High quality, suitable for team header.`
    } else {
      enhancedPrompt = prompt
    }

    // Call Gemini API for text-to-image generation
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        safetySettings: [
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_LOW_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_LOW_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_LOW_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_LOW_AND_ABOVE"
          }
        ],
        generationConfig: {
          temperature: 0.4,
          candidateCount: 1,
          maxOutputTokens: 1024,
        }
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to generate image', details: errorData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return new Response(
        JSON.stringify({ error: 'No image generated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const imageBase64 = data.candidates[0].content.parts[0].inlineData.data
    const imageUrl = `data:image/png;base64,${imageBase64}`

    return new Response(
      JSON.stringify({ imageUrl, prompt: enhancedPrompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-team-image function:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
