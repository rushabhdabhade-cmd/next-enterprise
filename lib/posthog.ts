import posthog, { type PostHog } from 'posthog-js'
import { env } from '../env.mjs'

if (typeof window !== 'undefined') {
    const key = env.NEXT_PUBLIC_POSTHOG_KEY
    const host = env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

    if (key) {
        posthog.init(key, {
            api_host: host,
            persistence: 'localStorage+cookie',
            capture_pageview: false, // We use the custom component for more control
            loaded: (ph: PostHog) => {
                if (process.env.NODE_ENV === 'development') ph.debug()
            },
        })
    }
}

export { posthog }
