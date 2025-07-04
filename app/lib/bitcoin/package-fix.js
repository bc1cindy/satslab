// This file helps resolve Bitcoin library dependencies in Next.js
// Add to next.config.js webpack configuration if needed

const bitcoinDependencies = {
  'tiny-secp256k1': require.resolve('tiny-secp256k1'),
  'ecpair': require.resolve('ecpair'),
  'bitcoinjs-lib': require.resolve('bitcoinjs-lib')
}

module.exports = bitcoinDependencies