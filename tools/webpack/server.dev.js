/**
 * Created by JP on 2017/3/20.
 */

import webpack from 'webpack'
import path from 'path'
import serverSharedConfig from './server.shared'
import VirtualModulePlugin from '../plugins/virtual-module-plugin'
import MarkoServerBundlePatcherPlugin from '../plugins/marko-server-bundle-patcher-plugin'

export default Object.assign({}, serverSharedConfig, {
  devtool: 'eval-source-map',

  module: {
    rules: [{
        test: /\.(js)$/,
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: './.cache/babel-loader'
          }
        }],
        include: [path.join(process.cwd(), 'src')]
      },

      {
        test: /\.marko$/,
        loader: 'marko-loader'
      },

      {
        test: /\.(scss|less|css)$/i,
        use: ['null-loader']
      },

      {
        test: /\.(ico|gif|png|jpg|jpeg|webp|mp4|webm|wav|mp3|m4a|aac|oga)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            emitFile: false
          }
        }]
      },

      {
        test: /\.(woff2?|ttf|eot|svg)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'font/[name].[ext]',
            emitFile: false
          }
        }]
      }

    ]
  },

  externals: [
    (context, request, callback) => {
      const isExternal =
        // the module name start with ('@' or 'a-z') character and contains 'a-z' or '/' or '.' or '-' or '0-9'
        request.match(/^[@a-z][a-z/.\-0-9]*$/i) && !request.match(/\.(css|less|scss)$/i)
      //environment config file, auto generated during build
      //console.log(request + '--------' + Boolean(isExternal))

      callback(null, Boolean(isExternal))
    }
  ],

  plugins: [
    new webpack.DefinePlugin({
      '__BROWSER__': false,
      '__DEV__': true
    }),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),

    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install()',
      raw: true,
      entryOnly: false
    }),

    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),

    new MarkoServerBundlePatcherPlugin(),

    new VirtualModulePlugin({
      moduleName: 'src/assets.json',
      contents: () => {
        //generate assets from router settings
        return JSON.stringify({
          "test": {
            "js": "http://localhost:3000/test/script.js"
          },
          "home": {
            "js": "http://localhost:3000/home/script.js"
          }
        })
      }
    })
  ],

  stats: {
    colors: true,
    warnings: false
  }
})
