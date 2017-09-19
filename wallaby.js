module.exports = function (wallaby) {
  return {
    files: [
      {pattern: 'node_modules/babel-polyfill/dist/polyfill.js', instrument: false},
      {pattern: 'src/**/*.*.test.js', ignore: true},
      'src/**/*.js'
    ],
    tests: [
      'src/**/*.*.test.js'
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
