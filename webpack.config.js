module.exports = function (configs, webpack, ctx) {
    //configs 为默认配置，可以在这里对其进行修改
    //webpack 当前 webpack 实例
    //ctx 当前构建「上下文实例」
    //configs.target = "electron-renderer"
    //configs.externals["antd"]="ANTD"
    //configs.externals["react-router-dom"]="ReactRouterDOM"
    configs.externals = {
        'react': 'React'
        , 'react-dom': 'ReactDOM'
        , 'react-router-dom': 'ReactRouterDOM'
    }
    //console.log(configs.externals);
    //configs.externals = {}
    //console.log(ctx);
    if (ctx.command == "build") {
        configs.plugins.push(
            new webpack.ContextReplacementPlugin(
                /moment[\\\/]locale$/,
                /^\.\/(zh-cn)$/
            ), new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify("production")// JSON.stringify('production')
                }
            })
            // 其他 plugin...
        )
    }
};