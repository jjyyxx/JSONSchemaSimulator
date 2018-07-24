import RefParser from 'json-schema-ref-parser'
import { JSONSchema6 } from 'json-schema'

import { generate } from './generate'

export async function load(raw: JSONSchema6, {
  generationLimit = -1
} = {}) {
  const schema = await new RefParser().dereference(raw)
  let generations = 0
  return (function* () {
    while (generationLimit !== generations) {
      ++generations
      yield generate(<JSONSchema6>schema)
    }
  })()
}
