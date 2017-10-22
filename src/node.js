'use strict'

import Parsimonious from './Parsimonious'

const parse = Parse || require('parse/node')

export default Object.freeze(new Parsimonious(Parse))
