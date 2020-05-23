// eslint-disable-next-line import/no-extraneous-dependencies
import webpack from 'webpack';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import config from '../webpack.config.prod';

config.plugins.push(new BundleAnalyzerPlugin());

process.env.NODE_ENV = 'production';

const compiler = webpack(config);

compiler.run((error, stats) => {
  if (error) {
    throw new Error(error);
  }

  console.log(stats); // eslint-disable-line no-console
});
