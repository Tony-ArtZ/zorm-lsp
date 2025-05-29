# Zorm Language Support

A comprehensive Visual Studio Code extension providing Language Server Protocol (LSP) support for **Zorm** - a powerful Object-Relational Mapping (ORM) framework for the Zig programming language.

## Overview

Zorm enables developers to define database schemas using a clean, declarative syntax that compiles to efficient Zig code. This extension provides rich language support for `.zorm` schema files, including syntax highlighting, intelligent code completion, real-time validation, and diagnostic reporting.

## Features

### 🎨 **Syntax Highlighting**

- Rich syntax highlighting for Zorm schema files (`.zorm`)

### 🧠 **Intelligent Code Completion**

- Auto-completion for Zorm keywords (`model`, `field`, `config`, etc.)
- Smart suggestions based on context

### 🔧 **Language Server Features**

- Full LSP implementation for optimal performance
- Incremental document synchronization
- Error diagnostics with actionable feedback
- Support for VS Code's built-in language features

### 📝 **Schema Structure Support**

Complete support for Zorm schema elements:

- **Configuration blocks**: Database backend configuration
- **Model definitions**: Table/entity definitions
- **Field declarations**: Column definitions with types and constraints
- **Annotations**: Metadata for fields (`@primary_key`, `@unique`, `@nullable`, etc.)
- **Comments**: Single-line and multi-line comment support

## Installation

1. Open Visual Studio Code
2. Go to the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for "Zorm Language Support"
4. Click Install

## Usage

### Creating Zorm Schema Files

1. Create a new file with the `.zorm` extension
2. Start defining your schema:

```zorm
[config]
backend = "postgresql"
database = "myapp"

model User {
    id: integer @primary_key @auto_increment
    username: varchar(50) @unique @not_null
    email: varchar(255) @unique @not_null
    created_at: timestamp @default("now()")
    updated_at: timestamp @nullable
}

model Post {
    id: integer @primary_key @auto_increment
    title: varchar(255) @not_null
    content: text @nullable
    user_id: integer @foreign_key(User.id)
    published: boolean @default(false)
}
```

### Supported Database Types

- `integer`, `bigint`, `smallint`
- `varchar(n)`, `text`
- `boolean`
- `timestamp`, `date`, `time`
- `decimal(p,s)`, `float`, `double`
- `json`, `jsonb`

### Supported Annotations

- `@primary_key` - Mark field as primary key
- `@unique` - Add unique constraint
- `@not_null` / `@nullable` - Control null constraints
- `@auto_increment` - Auto-incrementing fields
- `@default(value)` - Set default values
- `@foreign_key(table.field)` - Foreign key relationships

## Requirements

- Visual Studio Code 1.100.0 or higher
- Zig programming language (for compiling generated code)
- Node.js (for extension development)

## Extension Settings

This extension contributes the following settings:

- `zorm.enable`: Enable/disable Zorm language support
- `zorm.validation.enabled`: Enable/disable real-time validation
- `zorm.completion.enabled`: Enable/disable auto-completion
- `zorm.diagnostics.enabled`: Enable/disable diagnostic reporting

## Supported Backends

Currently supported database backends:

- PostgreSQL (`postgresql`)
- MySQL (`mysql`)
- SQLite (`sqlite`)
- More backends coming soon!

## Known Issues

- Complex nested schema validation is still in development
- Some advanced SQL features may not be fully supported yet
- Performance optimization for very large schema files is ongoing

Please report issues on our [GitHub repository](https://github.com/your-repo/zorm-vscode).

## Release Notes

### 0.0.1

Initial release of Zorm Language Support:

- Basic syntax highlighting for `.zorm` files
- LSP server implementation with validation
- Auto-completion for keywords and types
- Real-time diagnostics and error reporting
- Support for model definitions and field declarations
