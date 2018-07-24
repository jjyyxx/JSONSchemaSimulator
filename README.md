# Schema Generator

> To simplify the problem and meet the demand, the current solution is quite **specific** to the generation of tmdoc object instead of a complete support of all the json schema specification.

It is simple to use:
```typescript
const schemas: JSONSchema6[] = [{
  type: 'any'
}, {
  type: 'array'
}, {
  type: 'boolean'
}, {
  type: 'integer'
}, {
  type: 'number'
}, {
  type: 'object'
}, {
  type: 'string'
}, require('./test/schema.json')]

for (const schema of schemas) {
  load(schema, {generationLimit: 100}).then((r) => {
    console.log(schema)
    const rr = [...r] // if no generationLimit is specified, the spread syntax should not be used.
  })
}
```