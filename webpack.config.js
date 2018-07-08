var path = require('path');
var ROOT_PATH = path.resolve(__dirname);
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
	template: __dirname + '/index.html',
	filename: 'index.html',
	inject: 'body'
});
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
	entry: [ROOT_PATH +'/src/index.jsx'],

	output: {
		filename: "bundle.js",
		path: ROOT_PATH + '/lib/'
	},

	module: {
		loaders: [
			{
				test: /\.js$|\.jsx$/,
				include: __dirname + '/src/',
				loader: "babel-loader",
				exclude: /node_modules/
			},
			{
		        test: /\.scss$|\.css$/,
		        loaders: ["style-loader", "css-loader"]
		    },
		    {
	          	test: /\.woff2?$|\.ttf$|\.eot$|\.otf$|\.jpg$|\.png$|\.svg$/,
	          // loader: 'file-loader?name=[name].[ext]'
	          	use: [
	                {
	                    loader: 'file-loader',
	                    options: {
	                        name: '[path][name]-[hash:8].[ext]'
	                    },
	                },
	            ]
	        },
	        { test: /\.json$/, loader: "json-loader" },
		]
	},
	resolve: {
    	extensions: ['.js', '.jsx', '.json'],
  	},

  	plugins: [
		HTMLWebpackPluginConfig,
		new ExtractTextPlugin("./style.css", {allChunks: true})],

	// https://webpack.github.io/docs/configuration.html#devtool
    // devtool: '#inline-source-map'
}