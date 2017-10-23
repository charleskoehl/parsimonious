'use strict'

import Parsimonious from './Parsimonious'

if (typeof Parse === 'object' ) {
  Parsimonious.setParse(Parse)
} else {
  Parsimonious.setParse(require('parse/node'))
}

export default Parsimonious
