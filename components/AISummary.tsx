"use client"

import React from "react"
import { Sparkles } from "lucide-react"

/**
 * AISummary component - displayed based on the 'ai-summaries' feature flag.
 * Designed to be easily connected to an API later.
 */
export default function AISummary({ trackId }: { trackId: string }) {
    // Logic to fetch AI summary would go here later

    return (
        <div className="mt-6 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3 text-purple-600 dark:text-purple-400">
                <Sparkles size={18} />
                <h3 className="text-sm font-bold uppercase tracking-wider">AI Insight</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">
                "This track features a vibrant fusion of electronic textures and rhythmic depth,
                often associated with high-energy peak moments. Our AI analysis suggests it pairs
                well with late-night focus sessions."
            </p>
            <div className="mt-4 text-[10px] text-gray-400 font-medium">
                AI-generated summary for Track ID: {trackId}
            </div>
        </div>
    )
}
