import astroConfig from './astro/eslint.config.mjs';

export default astroConfig.map((config, index) => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return config;
  }

  return {
    name: `astro-scoped-${index}`,
    basePath: 'astro',
    ...config,
  };
});
