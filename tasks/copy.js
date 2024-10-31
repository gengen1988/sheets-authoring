const fs = require('fs/promises')
const path = require('path')

const src = 'luban-project/Output'
const dest = '../Assets/LubanGenerated'

// Copy files recursively
async function copyDir(srcDir, destDir) {
    const entries = await fs.readdir(srcDir, { withFileTypes: true })

    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry.name)
        const destPath = path.join(destDir, entry.name)

        if (entry.isDirectory()) {
            await fs.mkdir(destPath, { recursive: true })
            await copyDir(srcPath, destPath)
        } else {
            await fs.copyFile(srcPath, destPath)
        }
    }
}

module.exports = async function () {
    try {
        // Create destination directory if it doesn't exist
        await fs.mkdir(dest, { recursive: true })
        await copyDir(src, dest)
        console.log(`Copied ${src} to ${dest}`)
    } catch (err) {
        console.error('Error copying directory:', err)
    }
}