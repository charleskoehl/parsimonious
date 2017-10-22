'use strict'

import Parsimonious from './Parsimonious'

const parse = window.Parse || require('parse')

export default Object.freeze(new Parsimonious(parse))
