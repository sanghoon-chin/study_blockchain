const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path')
const webpack = require('webpack')

module.exports = {
    entry: {
        student: './src/student/index.ts',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                  path.resolve(__dirname, 'src/js')
                ],
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env'],
                    plugins: ['@babel/plugin-proposal-class-properties']
                  }
                }
              },
            // {
            //     test: /\.s[ac]ss$/i,
            //     use: [
            //         'style-loader',
            //         'css-loader',
            //         'sass-loader'
            //     ]
            // },
            // {
            //     test: /\.css$/i,
            //     use: [
            //         "style-loader",
            //         "css-loader"
            //     ],
            // },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            // {
            //     test: /\.(svg|eot|woff|woff2|ttf)$/,
            //     use: [
            //         {
            //             loader: 'file-loader',
            //             // options: {
            //             //     outputPath: 'assets/fonts',
            //             //     publicPath: '/assets/fonts'
            //             // }
            //         }
            //     ]
            // }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/student/index.html',
            filename: 'student.html',
            chunks: ['student'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
          }),
        // new CopyPlugin({
        //     patterns: [
        //         { from: "src/assets", to: "assets" }
        //     ],
        // }),
    ],
    target: 'web',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/')
        },
        extensions: ['.js', '.ts', '.css', '.json'],
        fallback: {
            "fs": false,
            "tls": false,
            "net": false,
            "path": false,
            "zlib": false,
            "http": false,
            "https": false,
            "stream": false,
            "crypto": false,
            "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
            "os": false,
            "assert": false,
          } 
    },
    mode: 'development',
    devServer: {
        port: 5500
    },
    devtool: 'eval-cheap-source-map',
}