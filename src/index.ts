import RefParser from 'json-schema-ref-parser'
import { JSONSchema6 } from 'json-schema'

const refParser = new RefParser()

export async function load(raw: object) {
  const schema = await refParser.dereference(raw)
  return (function* () {
    while (true) {
      yield generate(<JSONSchema6>schema)
    }
  })()
}

function generate(schema: JSONSchema6): object {
  return {}
}

// load({}).then((r) => {
//   r.next()
//   r.next()
//   r.next()
//   r.next()
// })