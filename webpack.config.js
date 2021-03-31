const fs = require('fs');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const IS_PROD = process.env.NODE_ENV === 'production';

const optimization = {
    minimize: IS_PROD,
    minimizer: [
        new TerserPlugin({
            extractComments: false,
            terserOptions: {
                ie8: false,
                ecma: 8,
                output: {
                    comments: false,
                    beautify: false
                },
                compress: {
                    drop_console: false
                },
                warnings: false
            }
        })
    ]
};

const rules = [{
    test: /\.(glsl)$/,
    loader: 'webpack-glsl-loader'
},{
    test: /\.(ts)$/,
    loader: 'awesome-typescript-loader'
}];

module.exports = {
    devServer: {
        hot: !IS_PROD,
        contentBase: './app',
        host: '0.0.0.0',
        disableHostCheck: true,
        stats: {
            all: false,
            errors: true,
            colors: true,
            assets: true
        }
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    entry: {
        app: ['./src/index.ts']
    },
    output: {
        path: path.join(__dirname, './app'),
        publicPath: '/',
        filename: 'scripts/[name].js',
        library: 'appLibrary',
        libraryTarget: 'umd',
        chunkFilename: '[name].js',
        globalObject: 'this'
    },
    plugins: [],
    optimization,
    module: {
        rules
    },
    performance: {
        hints: false
    },
    devtool: false,
    mode: IS_PROD ? 'production' : 'development'
};
