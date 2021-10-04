module.exports = {
  mount: {
    "content": { url: '/' }
  },
  plugins: [
    ['./plugins/latex.js', {/* pluginOptions */ }],
    ["@snowpack/plugin-sass"]
  ]
};