#!/usr/bin/env node
process.chdir(__dirname);
(async function () {
    await require('./tasks/install')()
    await require('./tasks/clean')()
    await require('./tasks/preprocess')()
    await require('./tasks/generate')()
    await require('./tasks/copy')()
})()