const { spawn } = require('child_process')

module.exports = async function () {
    const child = spawn('sh', ['gen.sh'], { cwd: 'luban-project' })
    child.stdout.on('data', data => {
        console.log(data.toString())
    })
    child.stderr.on('data', data => {
        console.error(data.toString())
    })
    await new Promise((resolve, reject) => {
        child.on('close', code => {
            if (code === 0) {
                resolve()
            } else {
                reject(new Error(`Process exited with code ${code}`))
            }
        })
    })
}