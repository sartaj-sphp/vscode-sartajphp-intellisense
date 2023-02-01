"use strict";
import * as fs from "fs";
import * as os from "os";
//import { basename, dirname, extname, join } from "path";
import { extname } from "path";
import * as vscode from "vscode";
import { AppInsightsClient } from "./appInsightsClient";

//const path = require('path');
const TMPDIR = os.tmpdir();

export class CodeManager implements vscode.Disposable {
    //private _outputChannel: vscode.OutputChannel;
    private _terminal: vscode.Terminal;
    private _isRunning: boolean;
    private _process:any;
    //private _codeFile: string;
    private _isTmpFile: boolean;
    //private _languageId: string;
    private _cwd: string;
    private _runFromExplorer: boolean;
    private _document: vscode.TextDocument;
    private _workspaceFolder: string;
    private _config: vscode.WorkspaceConfiguration;
    private _appInsightsClient: AppInsightsClient;

    constructor() {
        //this._outputChannel = vscode.window.createOutputChannel("Code");
        this._terminal = null!;
        this._appInsightsClient = new AppInsightsClient();
    }

    public onDidCloseTerminal(): void {
        this._terminal = null!;
    }

    public async run(fileUri: vscode.Uri = null!) {
        if (this._isRunning) {
            vscode.window.showInformationMessage("Code is already running!");
            return;
        }

        this._runFromExplorer = this.checkIsRunFromExplorer(fileUri);
        if (this._runFromExplorer) {
            this._document = await vscode.workspace.openTextDocument(fileUri);
        } else {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                this._document = editor.document;
            } else {
                vscode.window.showInformationMessage("No code found or selected.");
                return;
            }
        }

        this.initialize();

        const fileExtension = extname(this._document.fileName);
        //vscode.window.showInformationMessage("run " + fileExtension);

        this.getCodeFileAndExecute(fileExtension);
    }


    public stop(): void {
        this._appInsightsClient.sendEvent("stop");
        this.stopRunning();
    }

    public dispose() {
        this.stopRunning();
    }

    private checkIsRunFromExplorer(fileUri: vscode.Uri): boolean {
        const editor = vscode.window.activeTextEditor;
        if (!fileUri || !fileUri.fsPath) {
            return false;
        }
        if (!editor) {
            return true;
        }
        if (fileUri.fsPath === editor.document.uri.fsPath) {
            return false;
        }
        return true;
    }

    private stopRunning() {
        if (this._isRunning) {
            this._isRunning = false;
            vscode.commands.executeCommand("setContext", "sphp-runner.codeRunning", false);
            const kill = require("tree-kill");
            kill(this._process.pid);
        }
    }

    private initialize(): void {
        this._workspaceFolder = this.getWorkspaceFolder();
        this._cwd = this._workspaceFolder;
        if (this._cwd) {
            return;
        }
        this._cwd = TMPDIR;
    }


    private getWorkspaceFolder(): string {
        if (vscode.workspace.workspaceFolders) {
            if (this._document) {
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(this._document.uri);
                if (workspaceFolder) {
                    return workspaceFolder.uri.fsPath;
                }
            }
            return vscode.workspace.workspaceFolders[0].uri.fsPath;
        } else {
            return undefined!;
        }
    }

    private getCodeFileAndExecute(fileExtension: string): any {
        const activeTextEditor = vscode.window.activeTextEditor;
        if (activeTextEditor) {
            this._isTmpFile = false;
            //this._codeFile = this._document.fileName;
                return vscode.workspace.saveAll().then(() => {
                    this.executeCommand();
                });
/*
                return this._document.save().then(() => {
                    this.executeCommand(executor, appendFile);
                });
                */
            }
    }

    private executeCommand() {
        let command:string = "php -f " + this._cwd + "/start.php -- --ctrl index";
        //check sphp file exist
        if(fs.existsSync(this._cwd + "/app.sphp")){
            //var ppath = (process.platform == 'darwin' ? 'sphpserver-mac' : process.platform == 'win32' ? 'sphpserver-win.exe' : 'sphpserver-linux');
            //var bpath = path.resolve(path.dirname(require.main!.filename) + "/../"); 
            //command = bpath + "/vendor/sartajphp/sartajphp/res/sphpserver/" + ppath + " " + this._cwd + "/sapp.sphp";
            command = "php -f " + this._cwd + "/start.php -- --ctrl index";
            //command = "sphpdesk --proj " + this._cwd;
        }else{
            command = "php -f " + this._cwd + "/start.php -- --ctrl index";
        }
        this.executeCommandInTerminal(command);
        //this.executeCommandInOutputChannel(executor, appendFile);
    }

    private async executeCommandInTerminal(command: string) {
        let isNewTerminal = false;
        if (this._terminal === null) {
            this._terminal = vscode.window.createTerminal("Code");
            isNewTerminal = true;
        }
        this._terminal.show(true);
        this.sendRunEvent("php", true);
        command = this.changeFilePathForBashOnWindows(command);
        if (!isNewTerminal) {
            await vscode.commands.executeCommand("workbench.action.terminal.clear");
        }
        /*
        if (this._config.get<boolean>("fileDirectoryAsCwd")) {
            const cwd = this.changeFilePathForBashOnWindows(this._cwd);
            this._terminal.sendText(`cd "${cwd}"`);
        }
        */
        this._terminal.sendText(command);
    }

/*
    private rndName(): string {
        return Math.random().toString(36).replace(/[^a-z]+/g, "").substr(0, 10);
    }


    private getWorkspaceRoot(codeFileDir: string): string {
        return this._workspaceFolder ? this._workspaceFolder : codeFileDir;
    }

    /**
     * Gets the base name of the code file, that is without its directory.
     
    private getCodeBaseFile(): string {
        const regexMatch = this._codeFile.match(/.*[\/\\](.*)/);
        return regexMatch ? regexMatch[1] : this._codeFile;
    }

    /**
     * Gets the code file name without its directory and extension.
     
    private getCodeFileWithoutDirAndExt(): string {
        const regexMatch = this._codeFile.match(/.*[\/\\](.*(?=\..*))/);
        return regexMatch ? regexMatch[1] : this._codeFile;
    }
*/
    /**
     * Gets the directory of the code file.
     */
    //private getCodeFileDir(): string {
        //const regexMatch = this._codeFile.match(/(.*[\/\\]).*/);
        //return regexMatch ? regexMatch[1] : this._codeFile;
    //}

    /**
     * Gets the drive letter of the code file.
     */
    //private getDriveLetter(): string {
      //  const regexMatch = this._codeFile.match(/^([A-Za-z]:).*/);
        //return regexMatch ? regexMatch[1] : "$driveLetter";
    //}

    /**
     * Gets the directory of the code file without a trailing slash.
     
    private getCodeFileDirWithoutTrailingSlash(): string {
        return this.getCodeFileDir().replace(/[\/\\]$/, "");
    }

    /**
     * Includes double quotes around a given file name.
     
    private quoteFileName(fileName: string): string {
        return '\"' + fileName + '\"';
    }
*/

    private changeFilePathForBashOnWindows(command: string): string {
        if (os.platform() === "win32") {
            const windowsShell = vscode.env.shell;
            const terminalRoot = this._config.get<string>("terminalRoot");
            if (windowsShell && terminalRoot) {
                command = command
                    .replace(/([A-Za-z]):\\/g, (match, p1) => `${terminalRoot}${p1.toLowerCase()}/`)
                    .replace(/\\/g, "/");
            } else if (windowsShell && windowsShell.toLowerCase().indexOf("bash") > -1 && windowsShell.toLowerCase().indexOf("windows") > -1) {
                command = command.replace(/([A-Za-z]):\\/g, this.replacer).replace(/\\/g, "/");
            }
        }
        return command;
    }

    private replacer(match: string, p1: string): string {
        return `/mnt/${p1.toLowerCase()}/`;
    }


    private sendRunEvent(executor: string, runFromTerminal: boolean) {
        const properties = {
            runFromTerminal: runFromTerminal.toString(),
            runFromExplorer: this._runFromExplorer.toString(),
            isTmpFile: this._isTmpFile.toString(),
        };
        this._appInsightsClient.sendEvent(executor, properties);
    }
}

