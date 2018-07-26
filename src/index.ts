import { JSONSchema6 } from 'json-schema'
import RefParser from 'json-schema-ref-parser'

import { generate } from './generate'
import { normalize, OptionType, PartialOptionType } from './options'
import { clone } from './util'

type SchemaGenerator = IterableIterator<any> & {
  schema: JSONSchema6
  generate(): any
}

export async function load(raw: JSONSchema6, options: PartialOptionType = {}) {
  const normalizedOptions = normalize(options)
  const schema = <JSONSchema6>await new RefParser().dereference(clone(raw))
  let generations = 0
  const generator = <SchemaGenerator>(function* schemaGenerator() {
    while (normalizedOptions.generationLimit !== generations) {
      ++generations
      yield generate(schema, normalizedOptions)
    }
  })()
  generator.schema = <JSONSchema6>schema
  generator.generate = function generateWrap() {
    return this.next().value
  }
  return generator
}
