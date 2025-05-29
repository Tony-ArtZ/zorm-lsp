"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const diagnostics_1 = require("./diagnostics");
const validator_1 = require("./validator");
// Create a connection for the server
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Create a simple text document manager
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
connection.onInitialize(() => {
    return {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: false,
            },
        },
    };
});
// Provide completion items for .zorm files
connection.onCompletion((_params) => {
    const completions = [
        // Keywords
        { label: "backend", kind: node_1.CompletionItemKind.Keyword },
        { label: "model", kind: node_1.CompletionItemKind.Keyword },
        // Types (matching parser.zig and validator)
        { label: "Int", kind: node_1.CompletionItemKind.Class },
        { label: "String", kind: node_1.CompletionItemKind.Class },
        { label: "Bool", kind: node_1.CompletionItemKind.Class },
        { label: "Float", kind: node_1.CompletionItemKind.Class },
        { label: "DateTime", kind: node_1.CompletionItemKind.Class },
        { label: "ObjectId", kind: node_1.CompletionItemKind.Class },
        // Annotations
        { label: "@id", kind: node_1.CompletionItemKind.Property },
        { label: "@unique", kind: node_1.CompletionItemKind.Property },
        // Database types
        { label: "postgres", kind: node_1.CompletionItemKind.EnumMember },
        { label: "sqlite", kind: node_1.CompletionItemKind.EnumMember },
        { label: "mongo", kind: node_1.CompletionItemKind.EnumMember },
        { label: "mongodb", kind: node_1.CompletionItemKind.EnumMember },
        // Field types (lowercase variants for flexibility)
        { label: "int", kind: node_1.CompletionItemKind.Class },
        { label: "float", kind: node_1.CompletionItemKind.Class },
        { label: "string", kind: node_1.CompletionItemKind.Class },
        { label: "bool", kind: node_1.CompletionItemKind.Class },
        { label: "datetime", kind: node_1.CompletionItemKind.Class },
        { label: "relation", kind: node_1.CompletionItemKind.Class },
        { label: "objectid", kind: node_1.CompletionItemKind.Class },
    ];
    return completions;
});
documents.onDidChangeContent((change) => {
    const doc = change.document;
    const text = doc.getText();
    const lines = text.split(/\r?\n/);
    let diagnostics = [];
    // Use validator.ts for error checking
    const validationResult = (0, validator_1.validateZorm)(text);
    if (validationResult) {
        diagnostics = (0, diagnostics_1.getDiagnosticsFromParseError)(validationResult.error, lines, validationResult.line);
    }
    connection.sendDiagnostics({ uri: doc.uri, diagnostics });
});
documents.listen(connection);
connection.listen();
