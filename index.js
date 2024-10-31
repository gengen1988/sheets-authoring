#!/usr/bin/env node
process.chdir(__dirname)

/*
1. clean
2. preprocess
3. generate
4. copy
*/
async function main() {
    await require('./tasks/clean')()
    await require('./tasks/preprocess')()
    await require('./tasks/generate')()
    await require('./tasks/copy')()
}

main()