import fs from 'fs'
import child_process from 'child_process'
import appRoot from 'app-root-path'
import winston from 'winston'

export function checkIfBundleExists(path, callback) {
  fs.exists(path, exists => {
    return callback(exists)
  })
}

export function installNpmModules(name, config, callback) {
  return child_process.exec(
    `${appRoot.path}/node_modules/.bin/npm install ${name} --prefix ${config.prefix}`,
    { maxBuffer: 1024 * 500 },
    (error) => {
      if (error !== null) {
        winston.log('error', error)
        return callback(error)
      }
      callback(null)
    })
}

export function buildWithWebpack(packageInstallPath, entry, packageToCamelcase, outPath, callback) {
  return child_process.exec(
    `${appRoot.path}/node_modules/.bin/webpack ${entry} --output-filename ${packageToCamelcase}.js -p  --context ${packageInstallPath} --output-library ${packageToCamelcase} --output-library-target var --output-path ${outPath}`,
    { maxBuffer: 1024 * 500 },
    error => {
      if (error !== null) {
        winston.log('error', error)
        return callback(error)
      }
      callback(null)
    })
}

