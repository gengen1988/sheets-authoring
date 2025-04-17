const fs = require('fs/promises')
const os = require('os')
const path = require('path')
const sevenZip = require('7zip-min')

const LUBAN_DOWNLOAD_PATH = 'https://github.com/focus-creative-games/luban/releases/download/v3.14.0/Luban.7z'
const LUBAN_PROBE_PATH = '../Luban/Luban.dll'
const UNITY_PACKAGE_NAME = 'com.code-philosophy.luban'
const UNITY_PACKAGE_PATH = 'https://github.com/focus-creative-games/luban_unity.git'
const UNITY_PACKAGE_MANIFEST_PATH = '../Packages/manifest.json'

module.exports = async function () {
    await installDLL()
    await installUnityPackage()
}

async function installUnityPackage() {
    const jsonText = await fs.readFile(UNITY_PACKAGE_MANIFEST_PATH)
    const manifest = JSON.parse(jsonText)
    if (manifest.dependencies && manifest.dependencies[UNITY_PACKAGE_NAME] == UNITY_PACKAGE_PATH) {
        console.log('Luban package already installed, skipping')
        return
    }
    const toBeSave = {
        ...manifest,
        dependencies: {
            ...manifest.dependencies,
            [UNITY_PACKAGE_NAME]: UNITY_PACKAGE_PATH,
        }
    }
    const content = JSON.stringify(toBeSave, null, 2)
    await fs.writeFile(UNITY_PACKAGE_MANIFEST_PATH, content)
    console.log('Luban package installed')
}

async function installDLL() {
    try {
        await fs.access(LUBAN_PROBE_PATH)
        console.log('Luban DLL already exists, skipping download')
        return
    } catch {
        // DLL doesn't exist, continue with installation
    }

    // prepare temp dir
    const tempDir = path.join(os.tmpdir(), 'luban-dll')
    await fs.mkdir(tempDir, { recursive: true })
    const tempFile = path.join(tempDir, 'Luban.7z')

    // download
    const req = await fetch(LUBAN_DOWNLOAD_PATH)
    const arrayBuffer = await req.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.writeFile(tempFile, buffer)

    // unzip
    await new Promise((resolve, reject) => {
        sevenZip.unpack(tempFile, '..', err => {
            if (err) {
                reject(err)
            }
            else {
                resolve()
            }
        })
    })

    await fs.rm(tempDir, { recursive: true, force: true })
    console.log('Luban DLL downloaded')
}