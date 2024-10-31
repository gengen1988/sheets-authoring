module.exports = {
    multiline,
    multiline_pair,
}

function multiline(cell) {
    return cell
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .join(',')
}

/**
 * 1. each line contains a key-value pair, split with '*'
 * 2. trim key-value pair each part, such as: enemy_common_1 * 10 => enemy_common_1*10
 * 3. merge multiline pairs into single line, split with ',' with trim spaces
 * 4. default value is 1, if missing
 */
function multiline_pair(cell) {
    return cell
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .map(line => {
            const [key, value = '1'] = line.split('*').map(part => part.trim())
            return `${key}*${value}`
        })
        .join(',')
}