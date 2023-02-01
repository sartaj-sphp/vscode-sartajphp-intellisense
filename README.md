<h1 align="center">SartajPHP + PHP IntelliSense</h1>
<div align="center">
    <img src="./images/logo.png">
</div>
[![Join the chat at https://gitter.im/sartajphp/community](https://badges.gitter.im/sartajphp/community.svg)](https://gitter.im/sartajphp/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

This extension provides [SartajPHP](https://sartajphp.com/) support for 
SartajPHP Framework, php development + IntelliSense for Visual Studio Code.

## Installation

You need at least PHP 7.4 installed for the extension to work. You can either add it to your PATH or set the `php.executablePath` setting.

**Note: PHP 8.0 does work, PHP 8.1 support is work in progress.**

I recommend to disable VS Code's built-in PHP IntelliSense by setting `php.suggest.basic` to `false` to avoid duplicate suggestions.

## Features

### Completion

![Completion search demo](images/completion.gif)

### Signature Help

![Signature help demo](images/signatureHelp.gif)

### Workspace symbol search

![Workspace symbol search demo](images/workspaceSymbol.gif)

### Find all References

![Find References demo](images/references.png)

### Go to Definition

![Go To Definition demo](images/definition.gif)

### Hover

![Hover class demo](images/hoverClass.png)

![Hover parameter demo](images/hoverParam.png)

### Find all symbols

![Find all symbols demo](images/documentSymbol.gif)

### Column-accurate error reporting

![Error reporting demo](images/publishDiagnostics.png)


## Todo

- Run WebApp in browser
- Run App Events under cursor
- Run DeskApp in SphpServer
- Run Server App
- Identify TempFile Support
- Master Designer Support
- New Project Generator


## Credits

[PHP Intellisense](https://github.com/felixfbecker/vscode-php-intellisense)
[PHP Language Server](https://github.com/zobo/php-language-server)
