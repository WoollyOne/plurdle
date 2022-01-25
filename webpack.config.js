var path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        'server': './src/server.ts', 'public/client': './src/ts/index.ts',
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }, {
                test: /\.html$/i,
                loader: "html-loader",
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    externals: [nodeExternals(), "express"],
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
        clean: true,
    },
    plugins: [
            new CopyWebpackPlugin({ patterns: [
                { from: 'src/html/index.html', to: 'public/index.html' },
                { from: 'src/html/index.css', to: 'public/index.css' },
            ] 
        })
    ]
};