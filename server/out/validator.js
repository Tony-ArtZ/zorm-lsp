"use strict";
// validator.ts
// Error checking for zorm LSP, inspired by parser.zig error types
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatorError = void 0;
exports.validateZorm = validateZorm;
var ValidatorError;
(function (ValidatorError) {
    ValidatorError["InvalidConfig"] = "InvalidConfig";
    ValidatorError["UnknownBackend"] = "UnknownBackend";
    ValidatorError["InvalidModel"] = "InvalidModel";
    ValidatorError["InvalidField"] = "InvalidField";
    ValidatorError["MissingFieldType"] = "MissingFieldType";
    ValidatorError["UnexpectedEOF"] = "UnexpectedEOF";
    ValidatorError["OutOfMemory"] = "OutOfMemory";
})(ValidatorError || (exports.ValidatorError = ValidatorError = {}));
function validateZorm(text) {
    const lines = text.split(/\r?\n/);
    let inConfig = false;
    let backendFound = false;
    let modelOpen = false;
    let modelName = "";
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("[config]")) {
            inConfig = true;
            continue;
        }
        if (inConfig) {
            if (line.length === 0)
                continue;
            if (line.startsWith("backend ")) {
                backendFound = true;
                const backend = line.slice(8).trim();
                if (!backend)
                    return { error: ValidatorError.InvalidConfig, line: i };
                if (!/(postgres|sqlite|mongo(db)?)/.test(backend)) {
                    return { error: ValidatorError.UnknownBackend, line: i };
                }
            }
            else if (line.length > 0 && !line.startsWith("model ")) {
                return { error: ValidatorError.InvalidConfig, line: i };
            }
            if (line.startsWith("model ")) {
                inConfig = false;
            }
            else {
                continue;
            }
        }
        if (line.startsWith("model ")) {
            modelOpen = true;
            modelName = line
                .slice(6)
                .trim()
                .replace(/[ {\t]/g, "");
            if (!modelName)
                return { error: ValidatorError.InvalidModel, line: i };
            // Model name must be alphanumeric and start with a letter
            if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(modelName)) {
                return { error: ValidatorError.InvalidModel, line: i };
            }
            continue;
        }
        if (line.startsWith("}")) {
            if (!modelOpen)
                return { error: ValidatorError.InvalidModel, line: i };
            modelOpen = false;
            continue;
        }
        if (modelOpen && line.length > 0) {
            // Field line: name type [@constraint ...]
            const tokens = line.split(/\s+/);
            if (tokens.length < 2)
                return { error: ValidatorError.MissingFieldType, line: i };
            const [fieldName, typeStr, ...rest] = tokens;
            if (!fieldName || !typeStr)
                return { error: ValidatorError.InvalidField, line: i };
            // Field name must be alphanumeric and start with a letter
            if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(fieldName)) {
                return { error: ValidatorError.InvalidField, line: i };
            }
            // Check for valid type (case sensitive, as in parser.zig)
            const validTypes = [
                "Int",
                "String",
                "Float",
                "Bool",
                "DateTime",
                "ObjectId",
            ];
            let baseType = typeStr.endsWith("?") ? typeStr.slice(0, -1) : typeStr;
            if (!validTypes.includes(baseType) && rest.length === 0) {
                // If not a valid type and not a relation (which has no type in validTypes)
                return { error: ValidatorError.InvalidField, line: i };
            }
            // Check for duplicate constraints (e.g., @id @id)
            const constraintSet = new Set();
            for (const tok of rest) {
                if (tok.startsWith("@")) {
                    if (constraintSet.has(tok))
                        return { error: ValidatorError.InvalidField, line: i };
                    constraintSet.add(tok);
                }
                // Check for unknown constraint
                if (tok.startsWith("@") && !["@id", "@unique"].includes(tok)) {
                    return { error: ValidatorError.InvalidField, line: i };
                }
            }
        }
    }
    if (!backendFound)
        return { error: ValidatorError.InvalidConfig, line: 0 };
    if (modelOpen)
        return { error: ValidatorError.UnexpectedEOF, line: lines.length - 1 };
    return null;
}
