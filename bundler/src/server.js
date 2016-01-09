import express from 'express'
import winston from 'winston'
import { maxSatisfying as maxSatisfyingVersion } from 'semver'
import tmpdir from 'os-tmpdir'
import { sendServerError, sendNotFoundError } from 'npm-http-server/modules/ResponseUtils'
import getPackageInfo from './modules/getPackageInfo'
import parsePackageURL from 'npm-http-server/modules/parsePackageURL'
import createPackageURL from 'npm-http-server/modules/createPackageURL'
import { checkIfBundleExists, installNpmModules, buildWithWebpack } from './modules/builderUtils'
import { config } from './../package.json'

const TmpDir = tmpdir()
const App = express()

function builder(res, packageParam, callback) {

  let { packageName, version, filename, search } = parsePackageURL(packageParam)

  if (version == null)
    version = 'latest' // Use the latest version by default

  const packageToCamelcase = packageName.replace(/-([a-z])/g, g => g[1].toUpperCase())
  const config = {
    packageName: packageName,
    version: version,
    nameVersion: `${packageName}@${version}`,
    prefix: `${TmpDir}/modules/${packageName}@${version}`,
    outPath: `${TmpDir}/bundles/${packageName}@${version}`,
    bundlePath: `${TmpDir}/bundles/${packageName}@${version}/${packageToCamelcase}.js`,
    name: packageToCamelcase
  }

  checkIfBundleExists(config.prefix, (exists) => {
    if (exists) {
      return callback(config)
    }
    getPackageInfo(packageName, (error, info) => {

      if (error) {
        if (error.statusCode === 404) {
          sendNotFoundError(res, `package "${packageName}"`)
        } else {
          sendServerError(res, error)
        }
        return
      }

      if (info == null || info.versions == null) {
        sendServerError(res, new Error(`Unable to retrieve info for package ${packageName}`))
        return
      }

      const { versions, 'dist-tags': tags } = info

      if (version in versions) {
        const packageConfig = versions[version]
        installNpmModules(`${packageName}@${version}`, config, (err) => {
          if (err) {
            sendServerError(res, new Error(`Server error: where was en error retrieving ${name} from npm`))
            return
          }
          buildWithWebpack(`${config.prefix}/node_modules/${packageName}`, `./${packageConfig.main}`, packageToCamelcase, config.outPath, (err) => {
            if (err) {
              sendServerError(res, new Error(`Server error: where building ${name} with webpack`))
              return
            }
            return callback(config)
          })
        })

      } else if (version in tags) {
        builder(res, createPackageURL(packageName, tags[version], filename, search), callback)
      } else {
        const maxVersion = maxSatisfyingVersion(Object.keys(versions), version)
        if (maxVersion) {
          builder(res, createPackageURL(packageName, tags[version], filename, search), callback)
        } else {
          sendNotFoundError(res, `package ${packageName}@${version}`)
        }
      }

    })
  })
}

App.get('/bundle/:name', function (req, res) {
  builder(res, `/${req.params.name}`, (bundleData) => {
    res.redirect(`/bundle/${bundleData.nameVersion}/${bundleData.name}.js`)
  })
})

App.get('/bundle/:name/:bundle', function (req, res) {
  builder(res, `/${req.params.name}`, (bundleData) => {
    res.sendFile(bundleData.bundlePath)
  })
})

var server = App.listen(config.port, '0.0.0.0', function () {
  winston.log('info', 'Bundler app listening at http://%s:%s', server.address().address, server.address().port)
})
