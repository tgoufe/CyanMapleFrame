var webpack = require('webpack')
    , HtmlWebpackPlugin = require('html-webpack-plugin')
    ;

module.exports = {
    //入口文件，用于打包的文集爱你
    entry: {
        maple:'./src/js/index.js'

        , vendors: ['vue', 'lodash', 'hammer']
    },
    output: {
        path: 'dist',
        //文件输入的目录
        filename: '[name].js'
        //filename: '[name]-[hash:8].js'
    },
    plugins: [
       new webpack.optimize.UglifyJsPlugin({
            minimize: true
        })

        // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
        ,
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        // https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: true
        })

        // 将入口文件的数组打包成 vendors.js
        , new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
    ],
    resolve: {
        //用于缺省的文件名后缀
        extensions: ['', '.coffee', '.js'],
        //root:'E:/code/java/tgou/branch/dev/src/main/webapp/static/CyanMapleFrame/src/js/external',
        //别名
        alias: {
            'hammer':__dirname+'/src/js/external/lib/hammer/1.0.10/hammer.min',
            '_':__dirname+'/src/js/external/lib/lodash/4.11.1/lodash',
            'vue':__dirname+'/src/js/external/lib/vue/1.0.17/vue.min'
        }
    },
    //加载cdn,尽量保证不使用jquery
    externals: {
        //'jquery': 'jQuery',
        //'_':'_'
    },
    //加载器
    module: {
        loaders: [
            { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }, // use ! to chain loade   rs
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'} // inline base64 URLs for <=8k images, direct URLs for the rest
            , {
                test: /\.html$/
                , loader: 'vue-html'
            }
        ]
        , preLoader: [{    // jshint-loader
            test: /\.jsx?$/
            ,include: './src/js/'
            ,loader: 'jshint-loader'
        }]
    }
}

//'http://libs.baidu.com/jquery/2.1.1/jquery.min'