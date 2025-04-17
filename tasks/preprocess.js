const fs = require('fs/promises')
const path = require('path')
const XLSX = require('xlsx')
const registry = require('../processors')

const DEFINITION_COLUMN = 0
const SRC_DIRECTORY = 'data'
const DEST_DIRECTORY = 'luban-project/Input'

async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    const files = []

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            files.push(...await walk(fullPath))
        } else {
            files.push(fullPath)
        }
    }

    return files
}

function isBlankCell(cell) {
    if (!cell || cell.v === undefined) {
        return true
    }

    if (cell.v.toString().trim() === '') {
        return true
    }

    return false
}

function isHeaderRow(worksheet, row) {
    const address = XLSX.utils.encode_cell({ r: row, c: DEFINITION_COLUMN }) // first column is definition
    const cell = worksheet[address]
    return cell && cell.v.toString().startsWith('##')
}

function isPreprocessRow(worksheet, row) {
    const address = XLSX.utils.encode_cell({ r: row, c: DEFINITION_COLUMN })
    const cell = worksheet[address]
    return cell && cell.v === '##preprocess'
}

function preprocessToComment(worksheet, row) {
    const address = XLSX.utils.encode_cell({ r: row, c: DEFINITION_COLUMN })
    worksheet[address].v = '##'
}

function indexProcessors(worksheet, range, row, processorsByColumn) {
    for (let column = DEFINITION_COLUMN + 1; column <= range.e.c; column++) { // skip definition column
        const address = XLSX.utils.encode_cell({ r: row, c: column })
        const cell = worksheet[address]
        if (isBlankCell(cell)) {
            continue
        }
        const processors = cell.v.toString().split(',').map(s => s.trim())
        processorsByColumn[column] = processors
    }
}

function processContent(worksheet, range, row, processorsByColumn, processorRegistry) {
    for (let column = DEFINITION_COLUMN + 1; column <= range.e.c; column++) {
        const address = XLSX.utils.encode_cell({ r: row, c: column })
        const cell = worksheet[address]
        if (isBlankCell(cell)) {
            continue
        }

        const processors = processorsByColumn[column]
        if (!processors) {
            continue
        }

        processors.forEach(processorName => {
            const process = processorRegistry[processorName]
            if (process) {
                worksheet[address].v = process(cell.v)
            }
        })
    }
}

function processSheet(worksheet, processorRegistry) {
    // prepare stateful index
    const processorsByColumn = {}
    const overallRange = XLSX.utils.decode_range(worksheet['!ref'])

    // Iterate through all cells in worksheet
    for (let row = overallRange.s.r; row <= overallRange.e.r; row++) {
        if (isHeaderRow(worksheet, row)) {
            if (isPreprocessRow(worksheet, row)) {
                indexProcessors(worksheet, overallRange, row, processorsByColumn)
                preprocessToComment(worksheet, row)
            }
        }
        else {
            processContent(worksheet, overallRange, row, processorsByColumn, processorRegistry)
        }
    }
}

module.exports = async function preprocess() {
    const files = await walk(SRC_DIRECTORY)
    const filteredFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase()
        return ext === '.ods' || ext === '.xlsx'
    })
    for (const filePath of filteredFiles) {
        try {
            const data = await fs.readFile(filePath)
            const originWorkbook = XLSX.read(data)
            const newWorkbook = XLSX.utils.book_new()
            for (const sheetName of originWorkbook.SheetNames) {
                const worksheet = originWorkbook.Sheets[sheetName]
                processSheet(worksheet, registry)
                if (sheetName.startsWith('#')) {
                    const saveAsNew = XLSX.utils.book_new()
                    XLSX.utils.book_append_sheet(saveAsNew, worksheet, sheetName)

                    // Get relative path and construct destination path for the separated file
                    const relativePath = path.relative(SRC_DIRECTORY, filePath)
                    const separatedPath = path.join(DEST_DIRECTORY, path.dirname(relativePath), sheetName + '.xlsx')

                    // Ensure destination directory exists
                    await fs.mkdir(path.dirname(separatedPath), { recursive: true })

                    // Write the separated workbook
                    const separatedOutput = XLSX.write(saveAsNew, { type: 'buffer', bookType: 'xlsx' })
                    await fs.writeFile(separatedPath, separatedOutput)

                    console.log(`Separated ${sheetName} from ${filePath} to ${separatedPath}`)
                }
                else {
                    XLSX.utils.book_append_sheet(newWorkbook, worksheet, sheetName)
                }
            }

            // Only save if workbook has sheets
            if (newWorkbook.SheetNames.length == 0) {
                continue
            }

            // Get relative path and construct destination path
            const relativePath = path.relative(SRC_DIRECTORY, filePath)
            const newPath = makeLubanFilePath(relativePath)
            const destPath = path.join(DEST_DIRECTORY, newPath)

            // Ensure destination directory exists
            await fs.mkdir(path.dirname(destPath), { recursive: true })

            // Write the workbook to destination
            const output = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' })
            await fs.writeFile(destPath, output)

            console.log(`Processed ${filePath}`)

        } catch (err) {
            console.error(`Error processing ${filePath}:`, err)
        }
    }
}

function makeLubanFilePath(filePath) {
    const dirname = path.dirname(filePath)
    const basename = path.basename(filePath, path.extname(filePath))
    return path.join(dirname, '#' + basename + '.xlsx')
}
