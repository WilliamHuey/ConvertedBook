const smartAsset = require("postcss-smart-asset").default

module.exports = {
  plugins: [
    require("postcss-import")({
      from: "./content/styles/index.module.css"
    }),
    smartAsset({
      url: "inline"
    })
  ]
}