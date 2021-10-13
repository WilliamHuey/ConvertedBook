module.exports = {
  mount: {
    "content": { url: '/' },
    'node_modules/latex.css/fonts': '/fonts'
  },
  plugins: [
    ['./plugins/latex.js', {/* pluginOptions */ }],
    ["@snowpack/plugin-sass"]
  ]
};