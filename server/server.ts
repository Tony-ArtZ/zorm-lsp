import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  CompletionItemKind,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { getDiagnosticsFromParseError } from "./diagnostics";
import { validateZorm, ValidatorError, ValidationResult } from "./validator";
import * as fs from "fs";

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents = new TextDocuments(TextDocument);

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
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
    { label: "backend", kind: CompletionItemKind.Keyword },
    { label: "model", kind: CompletionItemKind.Keyword },
    // Types (matching parser.zig and validator)
    { label: "Int", kind: CompletionItemKind.Class },
    { label: "String", kind: CompletionItemKind.Class },
    { label: "Bool", kind: CompletionItemKind.Class },
    { label: "Float", kind: CompletionItemKind.Class },
    { label: "DateTime", kind: CompletionItemKind.Class },
    { label: "ObjectId", kind: CompletionItemKind.Class },
    // Annotations
    { label: "@id", kind: CompletionItemKind.Property },
    { label: "@unique", kind: CompletionItemKind.Property },
    // Database types
    { label: "postgres", kind: CompletionItemKind.EnumMember },
    { label: "sqlite", kind: CompletionItemKind.EnumMember },
    { label: "mongo", kind: CompletionItemKind.EnumMember },
    { label: "mongodb", kind: CompletionItemKind.EnumMember },
    // Field types (lowercase variants for flexibility)
    { label: "int", kind: CompletionItemKind.Class },
    { label: "float", kind: CompletionItemKind.Class },
    { label: "string", kind: CompletionItemKind.Class },
    { label: "bool", kind: CompletionItemKind.Class },
    { label: "datetime", kind: CompletionItemKind.Class },
    { label: "relation", kind: CompletionItemKind.Class },
    { label: "objectid", kind: CompletionItemKind.Class },
  ];
  return completions;
});

documents.onDidChangeContent((change) => {
  const doc = change.document;
  const text = doc.getText();
  const lines = text.split(/\r?\n/);
  let diagnostics: import("vscode-languageserver/node").Diagnostic[] = [];

  // Use validator.ts for error checking
  const validationResult = validateZorm(text);
  if (validationResult) {
    diagnostics = getDiagnosticsFromParseError(
      validationResult.error,
      lines,
      validationResult.line
    );
  }

  connection.sendDiagnostics({ uri: doc.uri, diagnostics });
});

documents.listen(connection);
connection.listen();
