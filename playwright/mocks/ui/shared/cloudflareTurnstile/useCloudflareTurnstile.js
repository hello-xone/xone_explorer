const useCloudflareTurnstile = () => {
  return {
    ref: { current: null },
    executeAsync: () => Promise.resolve('turnstile_token'),
    fetchProtectedResource: async(fetcher) => {
      const result = await fetcher();
      return result;
    },
  };
};

export default useCloudflareTurnstile;
