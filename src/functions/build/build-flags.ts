// Third party modules
import { intersection } from 'ramda';
import { Observable } from 'rxjs';

// Library modules
import Build from '../../commands/build.js';
import { ServerjsBuild } from './build-cli-input-async-checks.js';

export function buildFlags(this: Build, flags: Record<string, any>, serverjsBuild$: Observable<ServerjsBuild> | undefined) {
  const acceptedRequiredFlagKeys = Build.requiredFlags;
  const argsFlagKeys = Object.keys(flags);
  const recognizedFlags = intersection(acceptedRequiredFlagKeys, argsFlagKeys);
  
  const recognizedFlagsLen = recognizedFlags.length;

  const someFlagsRequiredRecognized = recognizedFlagsLen > 0 && recognizedFlagsLen < acceptedRequiredFlagKeys.length;

  let allRequiredFlagsRecognized = recognizedFlags.length === acceptedRequiredFlagKeys.length;

  // Observable serverjsBuild$ exists, which indicates that generation
  // will be done on a project folder. The required flags are not necessary
  if (serverjsBuild$) {
    allRequiredFlagsRecognized = true;
  }

  return {
    allRequiredFlagsRecognized,
    someFlagsRequiredRecognized,
    argsFlagKeys
  };
}
