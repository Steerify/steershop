import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

const INDEX_NOW_KEY = 'steersolo-indexnow-key-2024'
const HOST = 'steersolo.com'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { urls } = await req.json()

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(JSON.stringify({ error: 'urls array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Ping IndexNow (Bing + Yandex)
    const payload = {
      host: HOST,
      key: INDEX_NOW_KEY,
      urlList: urls.slice(0, 10000), // IndexNow max 10k per request
    }

    const endpoints = [
      'https://api.indexnow.org/indexnow',
      'https://yandex.com/indexnow',
    ]

    const results = await Promise.allSettled(
      endpoints.map((endpoint) =>
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then(async (r) => {
          const text = await r.text()
          return { endpoint, status: r.status, body: text }
        })
      )
    )

    return new Response(
      JSON.stringify({
        success: true,
        submitted: urls.length,
        results: results.map((r) =>
          r.status === 'fulfilled' ? r.value : { error: String(r.reason) }
        ),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
