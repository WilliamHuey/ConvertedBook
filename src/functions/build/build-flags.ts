// Third party modules
import { intersection } from 'ramda';

// Library modules
import Build from '../../commands/build';

export function buildFlags(this: Build, flags: any) {
  const acceptedRequiredFlagKeys = Build.requiredFlags,
    argsFlagKeys = Object.keys(flags),
    recognizedFlags = intersection(acceptedRequiredFlagKeys, argsFlagKeys),
    optionalArgsFlagKeys = intersection(Build.optionalFlags, argsFlagKeys),
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
