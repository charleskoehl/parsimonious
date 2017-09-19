import diff from 'jest-diff'

expect.extend({
  toBeEquivalentObject(received, expected) {
    const pass = this.equals(received, expected)
    const message = pass
      ? () => this.utils.matcherHint('.not.toBeEquivalentObject') + '\n\n' +
        `Expected value to not be (using matcher.equals):\n` +
        `  ${this.utils.printExpected(expected)}\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received)}`
      : () => {
        const diffString = diff(expected, received, {
          expand: this.expand,
        })
        return this.utils.matcherHint('.toBeEquivalentObject') + '\n\n' +
          `Expected value to be (using matcher.equals):\n` +
          `  ${this.utils.printExpected(expected)}\n` +
          `Received:\n` +
          `  ${this.utils.printReceived(received)}` +
          (diffString ? `\n\nDifference:\n\n${diffString}` : '')
      }
    return {actual: received, message, pass}
  }
})