import { JSONSchema6 } from 'json-schema'
import { INTEGER_NUMBER_INFER_PREFERENCE } from './config'

type InferableTypes = 'array' | 'object' | 'string' | typeof INTEGER_NUMBER_INFER_PREFERENCE
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
  [INTEGER_NUMBER_INFER_PREFERENCE]: [
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

const inferableTypes = <InferableTypes[]>Object.keys(inferableProperties)

export function infer(schema: JSONSchema6): InferableTypes | 'any' {
  const schemaKeys = Object.keys(schema)
  for (const typeName of inferableTypes) {
    if (schemaKeys.some((prop) => inferableProperties[typeName].includes(prop))) {
      return typeName
    }
  }
  return 'any'
}
