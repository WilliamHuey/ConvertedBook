export const checkResults = {
    msg: 'Start building: html, pdf, and epub',
    conditions: {
        exactMatchBuildOrder: false,
        additionalArgsOverBuildOrder: true,
        onlyOneBuildFormat: false,
        multipleArgsNotDependentBuildOrder: false,
        emptyArgsValidFlags: false,
        allRequiredFlagsRecognized: true,
        someFlagsRequiredRecognized: false,
        flags: {
            input: '/home/williamhuey/Contentss/Code/JavaScript/ConvertedBook/README.md',
            output: '/home/williamhuey/Downloads/'
        },
        argv: ['html', 'pdf', 'epub']
    },
    continue: true
}