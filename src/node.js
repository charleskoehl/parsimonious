'use strict'

import Parsimonious from './Parsimonious'

const parse = global.Parse || require('parse/node')

export default Object.freeze(new Parsimonious(parse))
