module.exports = {
  mount: {
    "content": { url: '/' },
    'node_modules/latex.css/fonts': '/fonts',
  },
  plugins: [
    ['./plugins/latex.js'],
    [
      "@snowpack/plugin-run-script",
      {
        "cmd": "npx postcss content/styles/index.module.css -o content/build/styles.css",
        "watch": "npx postcss content/styles/index.module.css -o content/build/styles.css -w"
      }
    ],
  ]
};