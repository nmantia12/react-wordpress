const HtmlWebPackPlugin = require( 'html-webpack-plugin' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const BrowserSyncPlugin = require( 'browser-sync-webpack-plugin' );

const ENV = require( 'dotenv' ).config();
const WP_ENV = process.env.WP_ENV || 'local';
const WP_HOME = process.env.WP_HOME || 'http://localhost';

const PROXY_URL = WP_HOME;

module.exports = {
	context: __dirname,
	entry: './src/index.js',
	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'main.js',
		publicPath: '/',
	},
	devServer: {
		historyApiFallback: true,
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
				test: /\.(png|jp?g|svg|gif|glb)$/,
				use: [
					{
						loader: 'file-loader',
					},
				],
			},
			{
				test: /\.(woff|woff2)$/,
				loader: 'url-loader?prefix=font/&limit=5000',
			},
			{
				test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
				loader:
					'url-loader?limit=1000&mimetype=application/octet-stream',
			},
			{
				test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'url-loader?limit=1000&mimetype=image/svg+xml',
			},
		],
	},
	resolve: {
		alias: {
			three$: 'three/build/three.min.js',
			'three/.*$': 'three',
		},
	},
	plugins: [
		new HtmlWebPackPlugin( {
			template: path.resolve( __dirname, 'public/index.html' ),
			filename: 'index.html',
		} ),
		new webpack.ProvidePlugin( {
			THREE: 'three',
		} ),
		new BrowserSyncPlugin(
			{
				host: 'localhost',
				port: 9001,
				proxy: PROXY_URL,
				files: [ '**/**/**/**/*.php' ],
				reloadDelay: 0,
			},
			{
				host: 'localhost',
				port: 8080,
				proxy: PROXY_URL,
				reloadDelay: 0,
			}
		),
	],
};
