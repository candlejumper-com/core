import { join } from "path"
import { sys, createProgram, getPreEmitDiagnostics, flattenDiagnosticMessageText, parseJsonConfigFileContent, Diagnostic } from "typescript"
import { worker } from "workerpool"

export interface IEditorCompileOptions {
    root: string
}



export const PATH_ROOT = join(__dirname, '../../../')

console.log(PATH_ROOT, PATH_ROOT)
export const PATH_CUSTOM = join(PATH_ROOT, 'custom')
export const PATH_CUSTOM_SRC = join(PATH_CUSTOM, 'src')
export const PATH_CUSTOM_DIST = join(PATH_CUSTOM, 'dist')
export const PATH_CUSTOM_DIST_BOTS = join(PATH_CUSTOM_DIST, 'bots')
export const PATH_TSCONFIG = join(PATH_CUSTOM, 'tsconfig.build.json')

worker({
    compile: async function (options: IEditorCompileOptions) {
        try {
            return compile(options)
        } catch (error) {
            console.error(error)
            throw error
        }
    }
})

async function compile(compileOptions: IEditorCompileOptions): Promise<readonly Diagnostic[]> {
    const tsconfig = require('../../../../../custom/tsconfig.build.json')
        // console.log(compileOptions.root)
    // transpile tsconfig object as tsconfig.json
    const { options, fileNames, errors } = parseJsonConfigFileContent(tsconfig, sys, compileOptions.root)

    // compile .ts files
    const program = createProgram({ options, rootNames: fileNames, configFileParsingDiagnostics: errors })
    const emitResult = program.emit()
    const diagnostics = getPreEmitDiagnostics(program)

    // Report errors
    reportDiagnostics(diagnostics.concat(emitResult.diagnostics))

    return diagnostics
}

function reportDiagnostics(diagnostics: Diagnostic[]): void {
    diagnostics.forEach(diagnostic => {
        let message = "Error";
        if (diagnostic.file) {
            const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            message += ` ${diagnostic.file.fileName} (${line + 1},${character + 1})`;
        }
        message += ": " + flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(message);
    });
}