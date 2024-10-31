const fs = require('fs/promises')

const dirs = [
    'luban-project/Data',
    'luban-project/Output',
    '../Assets/LubanGenerated',
]

module.exports = async function () {
    for (const dir of dirs) {
        try {
            await fs.rm(dir, { recursive: true, force: true })
            console.log(`Cleaned ${dir}`)
        } catch (err) {
            // Ignore if directory doesn't exist
            if (err.code === 'ENOENT') {
                continue
            }
            console.error(`Error cleaning ${dir}:`, err)
        }
    }
}