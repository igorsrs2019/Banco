const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// pdfjs-dist references canvas, fs, etc. in try-catch blocks.
// The package.json "browser" field already maps them to false (empty module).
// This resolver config is a safety net for any edge cases Metro might miss.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  canvas: require.resolve('./shims/empty.js'),
  path2d: require.resolve('./shims/empty.js'),
};

module.exports = config;
