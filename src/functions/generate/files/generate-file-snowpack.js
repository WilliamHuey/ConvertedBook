module.exports = {
  mount: {
    "content": { url: '/' }
  },
  plugins: [
    ['./plugins/latex.js'],
    [
      "@snowpack/plugin-run-script",
      {
        "cmd": "npx postcss content/styles/vendor.module.css -o content/build/styles/vendor.css & npx linaria -o 'content/build/' -r './content/' './content/styles/project.js'",
        "watch": "npx postcss content/styles/vendor.module.css -o content/build/styles/vendor.css & npx linaria -o 'content/build/' -r './content/' './content/styles/project.js'"
      }
    ]
  ]
};