import posthog from 'posthog-js'
import { env } from '../env.mjs'

if (typeof window !== 'undefined') {
    const key = env.NEXT_PUBLIC_POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = env.NEXT_PUBLIC_POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

    if (key) {
        posthog.init(key, {
            api_host: host,
            persistence: 'localStorage+cookie',
            capture_pageview: false, // We use the custom component for more control
            loaded: (ph) => {
                if (process.env.NODE_ENV === 'development') ph.debug()
            },
        })
    }
}

export { posthog }
