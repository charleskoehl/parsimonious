module.exports = function (wallaby) {
  return {
    files: [
      {pattern: 'node_modules/babel-polyfill/dist/polyfill.js', instrument: false},
      {pattern: 'test/**/*', ignore: true},
      'src/**/*.js'
    ],
    tests: [
      'test/**/*'
    ],
    testFramework: 'jest',
    compilers: {
      '**/*.js': wallaby.compilers.babel()
    },
    env: {
      type: 'node',
      runner: 'node'
    }
  }
}
