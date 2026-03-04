module.exports = {
    ci: {
        collect: {
            startServerCommand: "pnpm start",
            startServerReadyPattern: "Ready",
            startServerReadyTimeout: 30000,
            url: ["http://localhost:3000/", "http://localhost:3000/genres"],
            numberOfRuns: 3,
            settings: {
                preset: "desktop",
                onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
            },
        },
        assert: {
            assertions: {
                "categories:performance": ["warn", { minScore: 0.6 }],
                "categories:accessibility": ["error", { minScore: 0.7 }],
                "categories:best-practices": ["warn", { minScore: 0.7 }],
                "categories:seo": ["error", { minScore: 0.8 }],
            },
        },
        upload: {
            target: "filesystem",
            outputDir: ".lighthouseci",
        },
    },
}
