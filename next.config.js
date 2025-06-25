/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js', 'puppeteer']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'puppeteer': 'commonjs puppeteer'
      })
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig
