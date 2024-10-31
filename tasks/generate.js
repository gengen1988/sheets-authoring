const { spawn } = require('child_process')
const chalk = require('chalk')

module.exports = async function () {
    const child = spawn('sh', ['gen.sh'], { cwd: 'luban-project' })

    child.stdout.on('data', data => {
        const lines = data.toString().split('\n').filter(line => line.trim() !== '')
        for (let line of lines) {
            if (isErrorLog(line)) {
                console.error(chalk.red(line))
            }
            else {
                console.log(line)
            }
        }
    })

    child.stderr.on('data', data => {
        const lines = data.toString()
        console.error(chalk.red(lines))
    })

    await new Promise((resolve, reject) => {
        child.on('close', code => {
            if (code === 0) {
                resolve()
            } else {
                reject(new Error(`Code geneneration failed (${code})`))
            }
        })
    })
}

// Parse error logs for validation failures
function isErrorLog(line) {
    return line.includes('|ERROR|')
}



