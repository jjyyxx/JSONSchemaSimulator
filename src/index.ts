import RefParser from 'json-schema-ref-parser'
import { JSONSchema6 } from 'json-schema'

import { generate } from './generate'

const refParser = new RefParser()

export async function load(raw: object) {
  const schema = await refParser.dereference(raw)
  return (function* () {
    while (true) {
      yield generate(<JSONSchema6>schema)
    }
  })()
}

load({
  type: 'integer'
}).then((r) => {
  for(let i = 10; i--;) {
    console.log(r.next().value)
  }
})