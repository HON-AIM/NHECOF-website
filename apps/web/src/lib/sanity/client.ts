// Sanity client configuration.
// Uses a lazy getter so env validation only runs when the client is first used,
// not at module import time. This allows the dev server to start without .env.

import { createClient, type ClientConfig } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { getEnv } from '@/env'

let _config: ClientConfig | null = null

function getConfig(): ClientConfig {
  if (_config) return _config
  const env = getEnv()
  _config = {
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
    useCdn: true,
  }
  return _config
}

// Lazily created on first access
let _client: ReturnType<typeof createClient> | null = null

function getClient() {
  if (!_client) _client = createClient(getConfig())
  return _client
}

// Proxy that delegates to the lazy client
export const client = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return Reflect.get(getClient(), prop)
  },
})

let _previewClient: ReturnType<typeof createClient> | null = null

function getPreviewClient() {
  if (!_previewClient) {
    const env = getEnv()
    // The read token is server-only. Without it, `previewDrafts` cannot read a
    // private dataset, so draft mode would silently return nothing.
    _previewClient = createClient({
      projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
      useCdn: false,
      token: env.SANITY_API_READ_TOKEN,
      perspective: 'previewDrafts',
    })
  }
  return _previewClient
}

export const previewClient = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return Reflect.get(getPreviewClient(), prop)
  },
})

// Lazily create the image URL builder so env is not called at import time
let _builder: ReturnType<typeof imageUrlBuilder> | null = null

function getBuilder() {
  if (!_builder) _builder = imageUrlBuilder(getClient())
  return _builder
}

export function urlFor(source: unknown) {
  return getBuilder().image(source as never)
}
