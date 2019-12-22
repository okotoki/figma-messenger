import * as HtmlWebpackInlineSourcePlugin from 'html-webpack-inline-source-plugin'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import * as path from 'path'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { TypedCssModulesPlugin } from 'typed-css-modules-webpack-plugin'
import webpack from 'webpack'

const createConfig = (
  env: any,
  argv: webpack.Configuration
): webpack.Configuration => {
  return {
    mode: argv.mode,
    devtool: false,
    stats: 'minimal',
    entry: {
      ui: './src/ui/index.tsx', // The entry point for your UI code
      main: './src/main/index.ts'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js'
    },
    module: {
      rules: [
        { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
        {
          test: /\.css$/,
          loader: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader',
              options: {
                modules: true
              }
            }
          ]
        },
        {
          test: /\.(png|jpg|gif|webp|svg)$/,
          loader: [{ loader: 'url-loader' }]
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.css'],
      plugins: [new TsconfigPathsPlugin()]
    },
    plugins: [
      // new webpack.EnvironmentPlugin(["NODE_ENV", "API_ROOT", "API_KEY"]),
      new TypedCssModulesPlugin({
        globPattern: 'src/**/*.css'
      }),
      new HtmlWebpackPlugin({
        template: './src/ui/index.html',
        filename: 'ui.html',
        inlineSource: '.(js)$',
        chunks: ['ui']
      }),
      new HtmlWebpackInlineSourcePlugin()
    ]
  }
}

export default createConfig
