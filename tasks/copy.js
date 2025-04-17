const fs = require('fs/promises')
const path = require('path')

const scriptsSrc = 'luban-project/Output/Scripts'
const scriptsDest = '../Assets/LubanGeneratedScripts'
const tablesSrc = 'luban-project/Output/Tables'
const tablesDest = '../Assets/StreamingAssets/Tables'

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
        await fs.mkdir(scriptsDest, { recursive: true })
        await copyDir(scriptsSrc, scriptsDest)
        console.log(`Copied ${scriptsSrc} to ${scriptsDest}`)

        await fs.mkdir(tablesDest, { recursive: true })
        await copyDir(tablesSrc, tablesDest)
        console.log(`Copied ${tablesSrc} to ${tablesDest}`)
        
    } catch (err) {
        console.error('Error copying directory:', err)
    }
}