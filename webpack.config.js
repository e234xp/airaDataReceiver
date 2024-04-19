const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    target: "node",
    entry: ["babel-polyfill", path.resolve(__dirname, '', 'src/main.js')],
    output: {
        path: path.resolve(__dirname, ''),
        filename: 'bundle.js',
    },
    stats: {
        errorDetails: false
    },
    node: {
        __dirname: false
    },
    resolve: {
        // Add ".ts" and ".tsx" as resolvable extensions.
        extensions: [".js", ".tsx", ".ts", ".json", ".html"],
        modules: [
            path.resolve('.'),
            path.resolve('node_modules')
        ]
    },
    module: {
        rules: [
            // {
            //     test: /\.(png|jpe?g|gif|pem)$/,
            //     //exclude: /node_modules/,
            //     use: {
            //         loader: 'file-loader'
            //     },
            // },
            {
                test: /\.js$/,
                //exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.node$/,
                use: [{
                    loader: 'node-loader',
                    options: {
                        name: "[path][name].[ext]"
                    }
                }]
            }
        ]
    },
    externals: [nodeExternals()],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
            }),
        ],
    },
};