'use strict'

import Parsimonious from './Parsimonious'

const parse = typeof Parse === 'object' && Parse || require('parse/node')

export default Object.freeze(new Parsimonious(parse))
