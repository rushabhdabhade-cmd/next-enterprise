import posthog, { type PostHog } from 'posthog-js'

if (typeof window !== 'undefined') {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

    if (key) {
        posthog.init(key, {
            api_host: host,
            loaded: (ph: PostHog) => {
                if (process.env.NODE_ENV === 'development') ph.debug()
            },
            capture_pageview: false // We'll handle this manually or via specific events
        })
    } else {
        console.warn('PostHog key missing. Analytics will not be sent.')
    }
}

export { posthog }
