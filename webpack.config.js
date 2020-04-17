const HtmlWebPackPlugin = require( 'html-webpack-plugin' );
const path = require( 'path' );
const webpack = require('webpack');

module.exports = {
	context: __dirname,
	entry: './src/index.js',
	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'main.js',
		publicPath: "/"
	},
	devServer: {
		historyApiFallback: true
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_module/,
				use: 'babel-loader',
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					// Creates `style` nodes from JS strings
					'style-loader',
					// Translates CSS into CommonJS
					'css-loader',
					// Compiles Sass to CSS
					'sass-loader',
				],
			},
			{
				test: /\.(png|jp?g|svg|gif)$/,
				use: [{
					loader: "file-loader"
				}]
			}
		]
	},
	resolve: {
		alias: {
			three$: 'three/build/three.min.js',
			'three/.*$': 'three',
		}
	},
	plugins: [
		new HtmlWebPackPlugin({
			template: path.resolve( __dirname, 'public/index.html' ),
			filename: 'index.html'
		}),
		new webpack.ProvidePlugin({
			THREE: 'three'
		}),
	]
};
