async function rewrites() {
  return [
    { source: '/node-api/proxy/:slug*', destination: '/api/proxy' },
    { source: '/node-api/:slug*', destination: '/api/:slug*' },
    {
      source: '/api/v1/epochInfos/:path*',
      destination: 'http://192.168.2.167:8080/api/v1/epochInfos/:path*'
    }
  ].filter(Boolean);
}

module.exports = rewrites;
