const CompressionPlugin = require("compression-webpack-plugin");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  entry: "./src/index.tsx",
  mode: "production",
  output: {
    publicPath: "/",
    filename: "main.js",
  },
  plugins: [new CompressionPlugin()],
});
