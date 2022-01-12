// Copyright(c) 2022 Softensify Pty Ltd.www.softensify.com All rights reserved.

const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();
const path = require('path');

var webpack = smp.wrap({
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.html$/,
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
                loader: "raw-loader"
            },
            {
                test: /\.ts$/,
                loader: 'coverage-istanbul-loader',
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
                options: { transpileOnly: true, experimentalWatchApi: true }
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    cache: { type: 'filesystem' },
    output: {
        pathinfo: false
    }
});

module.exports = function (config) {
    config.set({

        frameworks: ['jasmine', 'mocha', 'chai', 'webpack'],

        reporters: ['mocha', 'coverage-istanbul', 'notify'],

        preprocessors: {
            'src/**/*.ts': ['webpack', 'sourcemap']
        },

        coverageIstanbulReporter: {
            reports: ['html', 'text-summary', 'lcovonly'],
            dir: path.join(__dirname, 'coverage'),
            fixWebpackSourcePaths: true,
            'report-config': {
                html: { outdir: 'html' }
            },
            instrumentation: {
                excludes: [
                    'src/**/*Test.ts'
                ]
            }
        },

        postLoaders: [
            {
                test: /\.ts$/i,
                include: /src/,
                exclude: /node_modules/,
                loader: 'istanbul-instrumenter-loader'
            }
        ],

        files: [
            { pattern: 'src/**/*.ts', watched: true }
        ],

        exclude: ['src/**/*Start.ts'],
        colors: true,
        loggers: [{ type: 'console' }],
        webpack: webpack,

        browserNoActivityTimeout: 100000,
        autoWatch: true,
        singleRun: false,
        failOnSkippedTests: true,

        concurrency: Infinity,

        client: {
            captureConsole: true
        },

        notifyReporter: {
            reportEachFailure: false
        },

        customLaunchers: {
            ChromeHeadless: {
                base: 'Chrome',
                flags: ['--headless', '--disable-gpu', '--remote-debugging-port=9222', '--no-sandbox', '--verbose', '--disable-web-security']
            },
        },

        browsers: ['ChromeHeadless']
    });
};