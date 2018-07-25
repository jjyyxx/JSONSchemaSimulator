import { JSONSchema6 } from 'json-schema'
import RefParser from 'json-schema-ref-parser'

import { generate } from './generate'

type SchemaGenerator = IterableIterator<any> & {
  schema: JSONSchema6
  generate(): any
}

export async function load(raw: JSONSchema6, {
  generationLimit = -1
} = {}) {
  const schema = await new RefParser().dereference(JSON.parse(JSON.stringify(raw)))
  let generations = 0
  const generator = <SchemaGenerator>(function* schemaGenerator() {
    while (generationLimit !== generations) {
      ++generations
      yield generate(<JSONSchema6>schema)
    }
  })()
  generator.schema = <JSONSchema6>schema
  generator.generate = function generateWrap() {
    return this.next().value
  }
  return generator
}
