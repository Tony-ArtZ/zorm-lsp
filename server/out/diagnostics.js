"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiagnosticsFromParseError = getDiagnosticsFromParseError;
const node_1 = require("vscode-languageserver/node");
// Map parser.zig errors to LSP diagnostics
function getDiagnosticsFromParseError(error, lines, errorLine) {
    let diagnostics = [];
    let message = error;
    let line = errorLine ?? 0;
    let severity = node_1.DiagnosticSeverity.Error;
    // If we have the exact line number, use it directly
    if (errorLine !== undefined) {
        line = errorLine;
    }
    else {
        // Fallback to the old logic for backward compatibility
        if (error.includes("InvalidConfig")) {
            message = "Invalid config section";
            line = lines.findIndex((l) => l.trim().startsWith("[config]") || l.includes("backend"));
            if (line === -1)
                line = 0;
        }
        else if (error.includes("UnknownBackend")) {
            message = "Unknown backend specified";
            line = lines.findIndex((l) => l.trim().startsWith("backend "));
            if (line === -1)
                line = 0;
        }
        else if (error.includes("InvalidModel")) {
            message = "Invalid model definition";
            line = lines.findIndex((l) => l.trim().startsWith("model "));
            if (line === -1)
                line = lines.findIndex((l) => l.trim() === "}");
            if (line === -1)
                line = 0;
        }
        else if (error.includes("InvalidField")) {
            message = "Invalid field definition";
            line = lines.findIndex((l) => {
                const t = l.trim();
                return (t.length > 0 &&
                    !t.startsWith("model ") &&
                    !t.startsWith("[config]") &&
                    !t.startsWith("backend ") &&
                    t !== "}");
            });
            if (line === -1)
                line = 0;
        }
        else if (error.includes("MissingFieldType")) {
            message = "Missing field type";
            line = lines.findIndex((l) => {
                const t = l.trim();
                return (t.length > 0 &&
                    t.split(/\s+/).length === 1 &&
                    !t.startsWith("model ") &&
                    t !== "}");
            });
            if (line === -1)
                line = 0;
        }
        else if (error.includes("UnexpectedEOF")) {
            message = "Unexpected end of file";
            line = lines.length - 1;
        }
        else if (error.includes("OutOfMemory")) {
            message = "Out of memory while parsing";
            line = 0;
        }
    }
    // Set more descriptive messages based on error type
    if (error.includes("InvalidConfig")) {
        message = "Invalid config section";
    }
    else if (error.includes("UnknownBackend")) {
        message = "Unknown backend specified";
    }
    else if (error.includes("InvalidModel")) {
        message = "Invalid model definition";
    }
    else if (error.includes("InvalidField")) {
        message = "Invalid field definition";
    }
    else if (error.includes("MissingFieldType")) {
        message = "Missing field type";
    }
    else if (error.includes("UnexpectedEOF")) {
        message = "Unexpected end of file";
    }
    else if (error.includes("OutOfMemory")) {
        message = "Out of memory while parsing";
    }
    diagnostics.push({
        severity,
        range: node_1.Range.create(node_1.Position.create(line, 0), node_1.Position.create(line, lines[line]?.length || 1)),
        message,
        source: "zorm-parser",
    });
    return diagnostics;
}
