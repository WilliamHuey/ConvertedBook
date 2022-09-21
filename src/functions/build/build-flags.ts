// Third party modules
import { intersection } from 'ramda';
import { Observable } from 'rxjs';

// Library modules
import Build from '../../commands/build';
import { optionalArgsFlagKeysArray } from './build-report';
import { ServerjsBuild } from './build-cli-input-async-checks';

export function buildFlags(this: Build, flags: Record<string, any>, serverjsBuild$: Observable<ServerjsBuild> | undefined) {

  const acceptedRequiredFlagKeys = Build.requiredFlags,
    argsFlagKeys = Object.keys(flags),
    recognizedFlags = intersection(acceptedRequiredFlagKeys, argsFlagKeys),
    optionalArgsFlagKeys = intersection(Build.optionalFlags, argsFlagKeys) as optionalArgsFlagKeysArray,
    recognizedFlagsLen = recognizedFlags.length,
    someFlagsRequiredRecognized = recognizedFlagsLen > 0 && recognizedFlagsLen < acceptedRequiredFlagKeys.length;

  let allRequiredFlagsRecognized = recognizedFlags.length === acceptedRequiredFlagKeys.length;

  // Observable serverjsBuild$ exists, which indicates that generation
  // will be done on a project folder. The required flags are not necessary
  if (serverjsBuild$) {
    allRequiredFlagsRecognized = true;
  }

  return {
    allRequiredFlagsRecognized,
    someFlagsRequiredRecognized,
    optionalArgsFlagKeys,
    argsFlagKeys
  };
}
