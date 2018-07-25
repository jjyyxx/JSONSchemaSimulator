import RefParser from 'json-schema-ref-parser'
import { JSONSchema6 } from 'json-schema'

import { generate } from './generate'

type SchemaGenerator = IterableIterator<any> & {
  generate(): any,
  schema: JSONSchema6
}

export async function load(raw: JSONSchema6, {
  generationLimit = -1
} = {}) {
  const schema = await new RefParser().dereference(raw)
  let generations = 0
  const generator = <SchemaGenerator>(function* () {
    while (generationLimit !== generations) {
      ++generations
      yield generate(<JSONSchema6>schema)
    }
  })()
  generator.schema = <JSONSchema6>schema
  generator.generate = function () {
    return this.next().value
  }
  return generator
}
