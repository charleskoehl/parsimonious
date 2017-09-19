module.exports = function (wallaby) {
  return {
    files: [
      {pattern: 'node_modules/babel-polyfill/dist/polyfill.js', instrument: false},
      {pattern: 'src/**/*.unit.test.js', ignore: true},
      'src/**/*.js'
    ],
    tests: [
      'src/**/*.unit.test.js'
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
