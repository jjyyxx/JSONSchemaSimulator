import { JSONSchema6 } from 'json-schema'
import { OptionType } from './options'

type InferableTypes = 'array' | 'object' | 'string' | 'number'
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

const inferableTypes = <InferableTypes[]>Object.keys(inferableProperties)

export function infer(schema: JSONSchema6, options: OptionType): InferableTypes | 'integer' | 'any' {
  const schemaKeys = Object.keys(schema)
  for (const typeName of inferableTypes) {
    if (schemaKeys.some((prop) => inferableProperties[typeName].includes(prop))) {
      return typeName === 'number' ? options.infer.numPreference : typeName
    }
  }
  return 'any'
}
