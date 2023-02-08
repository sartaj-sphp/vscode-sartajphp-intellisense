<h1 align="center">SartajPHP + PHP IntelliSense</h1>
<div align="center">
    <img src="./images/logo.png">
</div>

This extension provides [SartajPHP](https://sartajphp.com/) support for 
SartajPHP Framework, php development + IntelliSense for Visual Studio Code.
For Discussion [Join the chat](https://gitter.im/sartajphp/community)

## Installation

Add File Association for app, use vs code menu file->preferences->settings and search. 
"files.associations": {
        "*.app": "php",
        "*.front": "php",
        "*.sphp": "json"
    }
You need at least PHP 7.4 installed for the extension to work. You can either add it to your PATH or set the `php.executablePath` setting.

**Note: PHP 8.0 does work, PHP 8.1 support is work in progress.**

I recommend to disable VS Code's built-in PHP IntelliSense by setting `php.suggest.basic` to `false` to avoid duplicate suggestions.

## Key Binding and Commands

Run:- F7 , It detects settings from app.sphp if not available then run as console app

Stop:- Ctrl+Alt+s Stop Running Project or use CTRL + C if running in terminal

Create Project:- First open empty folder and run Command SartajPHP:create with ctrl+shift+p 

Create Phar Pacakge:- run Command SartajPHP:dist with ctrl+shift+p

## Todo

- SartajPHP Auto Complete Intellisense - Done
- PHP Auto Complete Intellisense - Done 
- Run DeskApp in SphpServer - Done
- Run Server App - Done
- Run Console App - Done
- Add SphpServer Support - Done
- Run WebApp in browser
- Run App Events under cursor
- Identify TempFile Support
- Master Designer Support
- New Project Generator



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


## Credits

[PHP Intellisense](https://github.com/felixfbecker/vscode-php-intellisense)
[PHP Language Server](https://github.com/zobo/php-language-server)
