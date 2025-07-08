/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações do servidor
  // Forçar o servidor a escutar em todas as interfaces
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  webpack: (config, { isServer }) => {
    // Handle WebAssembly modules
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    }

    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    // Fallbacks for node modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    return config
  },
}

module.exports = nextConfig