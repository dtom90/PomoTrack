const webpackConfig = {
  lintOnSave: 'warning',
  devServer: {
    overlay: {
      warnings: false,
      errors: false
    },
    allowedHosts: [
      'localhost',
      '0.0.0.0',
      'host.docker.internal'
    ]
  },
  publicPath: process.env.BASE_URL ? process.env.BASE_URL : '/',
  transpileDependencies: [
    'chart.js',
    'vue-chartjs'
  ],
  configureWebpack: {
    plugins: [],
    resolve: {
      alias: {
        vuedraggable: 'vuedraggable/src/vuedraggable'
      }
    },
    externals: {
      moment: 'moment'
    },
    optimization: {
      splitChunks: {
        minSize: 20000,
        maxSize: 700000
      }
    }
  },
  chainWebpack: (config) => {
    // Remove the existing babel rule for node_modules
    config.module.rules.delete('babel-modules')
    
    // Add new rule for chart.js and vue-chartjs
    config.module
      .rule('babel-chart')
      .test(/\.js$/)
      .include
      .add(/node_modules[\\/]chart\.js/)
      .add(/node_modules[\\/]vue-chartjs/)
      .end()
      .use('babel')
      .loader('babel-loader')
      .options({
        presets: [
          ['@vue/app', {
            useBuiltIns: 'entry',
            modules: false
          }]
        ],
        plugins: [
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-proposal-optional-chaining',
          '@babel/plugin-proposal-private-methods',
          '@babel/plugin-proposal-private-property-in-object'
        ]
      })
  }
}

if (process.env.ANALYZE_WEBPACK) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.configureWebpack.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
