// Third party modules
import { intersection } from 'ramda';
import { Observable } from 'rxjs';

// Library modules
import Build from '../../commands/build';
import { optionalArgsFlagKeysArray } from './build-report';
import { ServerjsBuild } from './build-cli-input-async-checks';

export function buildFlags(this: Build, flags: Record<string, any>, serverjsBuild$: Observable<ServerjsBuild>) {
  const acceptedRequiredFlagKeys = Build.requiredFlags,
    argsFlagKeys = Object.keys(flags),
    recognizedFlags = intersection(acceptedRequiredFlagKeys, argsFlagKeys),
    optionalArgsFlagKeys = intersection(Build.optionalFlags, argsFlagKeys) as optionalArgsFlagKeysArray,
    recognizedFlagsLen = recognizedFlags.length,
    allRequiredFlagsRecognized = recognizedFlags.length === acceptedRequiredFlagKeys.length,
    someFlagsRequiredRecognized = recognizedFlagsLen > 0 && recognizedFlagsLen < acceptedRequiredFlagKeys.length;

  return {
    allRequiredFlagsRecognized,
    someFlagsRequiredRecognized,
    optionalArgsFlagKeys,
    argsFlagKeys
  };
}
