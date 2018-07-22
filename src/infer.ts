import { JSONSchema6 } from 'json-schema'
type InferableTypes = 'array' | 'integer' | 'object' | 'string' | 'number'
const inferableProperties: {
  [key in InferableTypes]: string[]
} = {
  array: [
    'additionalItems',
    'items',
    'maxItems',
    'minItems',
    'uniqueItems'
  ],
  integer: [
    'exclusiveMaximum',
    'exclusiveMinimum',
    'maximum',
    'minimum',
    'multipleOf'
  ],
  number: [
    'exclusiveMaximum',
    'exclusiveMinimum',
    'maximum',
    'minimum',
    'multipleOf'
  ],
  object: [
    'additionalProperties',
    'dependencies',
    'maxProperties',
    'minProperties',
    'patternProperties',
    'properties',
    'required'
  ],
  string: [
    'maxLength',
    'minLength',
    'pattern'
  ]
}

const inferableTypes = <Array<InferableTypes>>Object.keys(inferableProperties)

const subschemaProperties: string[] = [
  'additionalItems',
  'items',
  'additionalProperties',
  'dependencies',
  'patternProperties',
  'properties'
]

export function infer(schema: JSONSchema6): InferableTypes | 'any' {
  for (const typeName of inferableTypes) {
    if (Object.keys(schema).some((prop) => inferableProperties[typeName].includes(prop))) {
      return typeName
    }
  }
  return 'any'
}
