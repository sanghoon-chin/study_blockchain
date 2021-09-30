const path = require('path');

module.exports = {
    entry: {
        main: "./src/main.ts"
    },
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true
                        }
                    }
                ],
                include: [path.resolve(__dirname, 'src')]
            }
        ]
    },
    mode: 'development',
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js']
    },
    externalsPresets: { node: true },
}