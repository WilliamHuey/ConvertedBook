// Third party modules
import { type as checkType } from 'ramda';

export enum stringTypes {
  'Object',
  'Number',
  'Boolean',
  'String',
  'Null',
  'Array',
  'RegExp',
  'Function',
  'Undefined'
}

export function typeCheck(val: any, type: stringTypes): boolean {
  return checkType(val) === stringTypes[type];
}