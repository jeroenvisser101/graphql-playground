/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import { parse, typeFromAST } from 'graphql'

/**
 * Provided previous "queryFacts", a GraphQL schema, and a query document
 * string, return a set of facts about that query useful for GraphiQL features.
 *
 * If the query cannot be parsed, returns undefined.
 */
export default function getQueryFacts(schema, documentStr): any {
  if (!documentStr) {
    return
  }

  let documentAST
  try {
    documentAST = parse(documentStr)
  } catch (e) {
    return
  }

  const variableToType = schema ? collectVariables(schema, documentAST) : null

  // Collect operations by their names.
  const operations: any[] = []
  documentAST.definitions.forEach(def => {
    if (def.kind === 'OperationDefinition') {
      operations.push(def)
    }
  })

  return { variableToType, operations }
}

/**
 * Provided a schema and a document, produces a `variableToType` Object.
 */
export function collectVariables(schema, documentAST) {
  const variableToType = Object.create(null)
  documentAST.definitions.forEach(definition => {
    if (definition.kind === 'OperationDefinition') {
      const variableDefinitions = definition.variableDefinitions
      if (variableDefinitions) {
        variableDefinitions.forEach(({ variable, type }) => {
          try {
            const inputType = typeFromAST(schema, getDeepType(type))
            if (inputType) {
              variableToType[variable.name.value] = inputType
            }
          } catch (e) {
            debugger
          }
        })
      }
    }
  })
  return variableToType
}

function getDeepType(type) {
  if (type.type) {
    return getDeepType(type.type)
  }
  return type
}
