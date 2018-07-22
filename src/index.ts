import RefParser from 'json-schema-ref-parser'
import { JSONSchema6 } from 'json-schema'

import { generate } from './generate'

export async function load(raw: JSONSchema6) {
  const schema = await new RefParser().dereference(raw)
  return (function* () {
    while (true) {
      yield generate(<JSONSchema6>schema)
    }
  })()
}
