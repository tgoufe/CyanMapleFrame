var webpack = require('webpack');
var path = require('path');
var compiler = require('vue-template-compiler')
module.exports = {
    //插件项
    plugins: [
        // new webpack.optimize.CommonsChunkPlugin({name:'base'})//提取公共文件
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     }
        // }) //压缩JS
    ],
    //页面入口文件配置
    entry: {
        maple: [__dirname + '/source/maple/index.js']
    },
    //入口文件输出配置
    output: {
        path: './',
        filename: './javascript/[name].js'
    },
    module: {
        //加载器配置
        loaders: [{
            test: /\.css$/,
            loader: 'style-loader!css-loader!sass-loader'
        }, {
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015']
            }
        }, {
            test: /\.scss$/,
            loader: 'style-loader!css-loader!sass-loader?sourceMap'
        }, {
            test: /\.(png|jpg)$/,
            loader: 'url-loader?limit=8192'
        }, {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
                loaders: {
                    js: 'babel-loader?{"presets":["es2015"],"plugins": ["transform-object-rest-spread"]}',
                    css: 'vue-style-loader!css-loader'
                }
            }
        }, {
            test: /\.json$/,
            loader: 'json-loader'
        }]
    },
    resolve: {
        modules: [__dirname]
    }
};