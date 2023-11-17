const { existsSync, writeFileSync } = require("fs")
const { join } = require("path")

const ROOT = join(__dirname, '../')
const PATH_CONFIG_DEFAULT_FILE = module.exports.PATH_CONFIG_DEFAULT_FILE = join(ROOT, '../config.default.json')
const PATH_CONFIG_EXAMPLE_FILE = module.exports.PATH_CONFIG_EXAMPLE_FILE = join(ROOT, '../config.example.json')
const PATH_CONFIG_CUSTOM_FILE = module.exports.PATH_CONFIG_CUSTOM_FILE = join(ROOT, '../config.json')

function load() {
    createConfigIfNotExists()
    console.log(PATH_CONFIG_DEFAULT_FILE)
    const configDefault = require(PATH_CONFIG_DEFAULT_FILE)
    const configCustom = require(PATH_CONFIG_CUSTOM_FILE)

    module.exports.config = Object.assign({}, configDefault, configCustom)
}

function createConfigIfNotExists() {
    if (!existsSync(PATH_CONFIG_CUSTOM_FILE)) {
        const exampleConfig = require(PATH_CONFIG_EXAMPLE_FILE)
        writeFileSync(PATH_CONFIG_CUSTOM_FILE, JSON.stringify(exampleConfig, null, 2))
    }
}

load()