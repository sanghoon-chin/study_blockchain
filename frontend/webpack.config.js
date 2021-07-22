const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    entry: {
        main: "./src/main/index.ts"
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: ['/node_modules']
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/main/index.html',
            filename: 'main.html',
            // publicPath: '../',
            chunks: ['main']
        }),
        new CopyPlugin({
            patterns: [
                { from: "src/assets", to: "assets" },
            ],
        }),
        new MiniCssExtractPlugin({
            linkType: false,
            filename: '[name].css'
        }),
    ],
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        contentBase: `${__dirname}/dist`,
        inline: true,
        hot: true,
        host: '127.0.0.1',
        port: 5500,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:4000',
                changeOrigin: true,
                secure: false,
                // pathRewrite: {'^/api': ''}
            },
            '/socket.io': {
                target: 'http://127.0.0.1:4000',
                ws: true,
                changeOrigin: true,
                secure: false
            }
        }
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            "@": path.resolve(__dirname, 'src'),
            "~": path.resolve(__dirname, '../server/src')
        }
    }
}