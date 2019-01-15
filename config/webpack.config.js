var chalk = require("chalk");
var fs = require('fs');
var path = require('path');
var useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

var env = process.env.MY_ENV;

useDefaultConfig.prod.resolve.alias = {
  "@app/env": path.resolve(environmentPath('prod'))
};

useDefaultConfig.dev.resolve.alias = {
  "@app/env": path.resolve(environmentPath('dev'))
};

if (env !== 'prod' && env !== 'dev') {
  // Default to dev config
  useDefaultConfig[env] = useDefaultConfig.dev;
  useDefaultConfig[env].resolve.alias = {
    "@app/env": path.resolve(environmentPath(env))
  };
}

useDefaultConfig[env].resolve.alias = {
  "@app": path.resolve('./src/app/'),
  "@components": path.resolve('./src/app/components/'),
  "@pages": path.resolve('./src/app/pages/'),
  "@assets": path.resolve('./src/assets/'),
  "@env": path.resolve(environmentPath(env)),
  "@services": path.resolve('./src/app/services/'),
  "@tests": path.resolve('./src/'),
  "@theme": path.resolve('./src/theme/')
};

function environmentPath(env) {
  let filePath = './src/environments/environment' + (env === 'prod' ? '.' + env : '') + '.ts';
  if (!fs.existsSync(filePath)) {
    console.log(chalk.red('\n' + filePath + ' does not exist!'));
  } else {
    return filePath;
  }
}

module.exports = function () {
  return useDefaultConfig;
};
