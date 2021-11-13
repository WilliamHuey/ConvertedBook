// Third party modules
import { type as checkType } from 'ramda';

type stringTypes = 'Object' | 'Number' |
    'Boolean' | 'String' | 'Null' | 'Array' | 'RegExp' |
    'Function' | 'Undefined';

const typeCheck = (val: any, type: stringTypes): boolean => {
    return checkType(val) === type;
}

export default typeCheck;