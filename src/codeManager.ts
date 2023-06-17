"use strict";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { extname } from "path";
import { spawn } from 'child_process';
import * as vscode from "vscode";
import { AppInsightsClient } from "./appInsightsClient";
import { LanguageClient } from 'vscode-languageclient/node';
import { TviewM } from "./tviewm";
import { registerDrop } from "./dropprovider";
import { TreeItem } from "./treeitem";
//import { SqlliteSphp } from "./sqlitesphp";

//const path = require('path');
const TMPDIR = os.tmpdir();

export class CodeManager implements vscode.Disposable {
    //private _outputChannel: vscode.OutputChannel;
    private _terminal: vscode.Terminal;
    private _isRunning: boolean;
    private _process: any;
    //private _codeFile: string;
    private _isTmpFile: boolean;
    //private _languageId: string;
    private _cwd: string;
    private _runFromExplorer: boolean;
    private _document: vscode.TextDocument;
    private _workspaceFolder: string;
    private _config: vscode.WorkspaceConfiguration;
    private _appInsightsClient: AppInsightsClient;
    private _executablePath: string;
    private _sphpExecutablePath: string;
    //private _resPath: string;
    private _context: vscode.ExtensionContext;
    private _client: LanguageClient;
    private _panel: vscode.WebviewPanel;
    private _panelStatus: boolean = false;
    public codeBlocks: any;

    constructor(contx: vscode.ExtensionContext, resPath: string, executablePath: string, sphpExecutablePath: string) {
        //this._outputChannel = vscode.window.createOutputChannel("Code");
        this._terminal = null!;
        this._executablePath = executablePath;
        this._sphpExecutablePath = sphpExecutablePath;
        //this._resPath = resPath;
        this._context = contx;
        this._appInsightsClient = new AppInsightsClient();
        this.initialize();
    }

    public onDidCloseTerminal(): void {
        this._terminal = null!;
    }
    private isSartajPHPProj(): boolean{
        if (fs.existsSync(this._cwd + "/start.php")) {
            return true;
        }else{
            vscode.window.showInformationMessage("SartajPHP Project Required!");
            return false;
        }
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

        const fileExtension = extname(this._document.fileName);
        //vscode.window.showInformationMessage("run " + fileExtension);

        this.getCodeFileAndExecute(fileExtension);
    }

    public projCreate() {
        if (!this.isSartajPHPProj()) {
            this.runPhpScript(this._executablePath, ['-f', this._context.asAbsolutePath("scripts/proj_create.php"), '--', this._workspaceFolder]);
            vscode.window.showInformationMessage("Project Created!");
        } else {
            vscode.window.showInformationMessage("Please Open a Empty Folder!");
        }
    }

    public async projCreateCordova() {
        var self = this;
        if (!this.isSartajPHPProj()) {
            var parentfolderpath = path.dirname(this._workspaceFolder);
            var parentfolder = path.basename(this._workspaceFolder);
            self.runPhpScript(self._executablePath, ['-f', self._context.asAbsolutePath("scripts/proj_create_cordova.php"), '--', parentfolderpath,parentfolder]);
            vscode.window.showInformationMessage("Project Created!");
        } else {
            vscode.window.showInformationMessage("Please Open a Empty Folder!");
        }
    }

    public projDist() {
        if (this.isSartajPHPProj()) {
            this.runPhpScript(this._executablePath, ['-f', this._context.asAbsolutePath("scripts/proj_dist.php"), '--', this._workspaceFolder]);
            vscode.window.showInformationMessage("Done Phar Package!");
        }
    }

    public dbView() {
        const self = this;
        if (this.isSartajPHPProj()) {
            self.runPhpScriptTimeLimit(self._executablePath, ['-f', self._context.asAbsolutePath("scripts/proj_db_view.php"), '--', self._workspaceFolder], function (str: string) {
                const tviewM = new TviewM();
                var rows = [];
                try{
                    rows = JSON.parse(str);
                }catch(e){
                    vscode.window.showErrorMessage(str);
                }
                const db1: any = tviewM.getDbView(rows,self._context);
                const dbView = vscode.window.createTreeView("sartajphp-db",
                {
                    treeDataProvider: db1,
                    canSelectMany: false,
                    dragAndDropController: db1
                });
                self._context.subscriptions.push(dbView);
                vscode.window.showInformationMessage("Done DB Connection!");
            });
        }
    }
    public dbGen(t1: TreeItem) {
        const self = this;
        if (this.isSartajPHPProj() && t1.parentb === '') {
            self.runPhpScriptTimeLimit(self._executablePath, ['-f', self._context.asAbsolutePath("scripts/proj_db_gen.php"), '--', self._workspaceFolder,t1.aname], function (str: string) {
                console.log(str);
                vscode.window.showInformationMessage("Form Generated with App!");
            });
        }
    }
    public projView() {
        if (!this._panelStatus) {
            //this._panel = vscode.window
            this._panel = vscode.window.createWebviewPanel(
                'designEditor',
                'Design Editor',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );
            /*
            this._panel.webview.onDidReceiveMessage(message => {
                //messageHandler(message, serverState, panel);
            });
            */

            this._panel.onDidDispose(() => {
                //stopServer();
                this._panelStatus = false;
            }, null, this._context.subscriptions);

            this._panelStatus = true;
        } else {
            //this._panel.webview.
            //vscode.
        }
        const editor = vscode.window.activeTextEditor;
        const self = this;
        if (editor) {
            editor.document.save().then(function () {
                self.runPhpScriptTimeLimit(self._executablePath, ['-f', self._context.asAbsolutePath("scripts/proj_view.php"), '--', editor.document.fileName, self._workspaceFolder], function (str: string) {
                    self._panel.webview.html = str;
                    vscode.window.showInformationMessage("Done Phar Package!");
                });
            });
        } else {
            vscode.window.showInformationMessage("No code found or selected.");
            return;
        }

    }
/*
    private async array2TreeItems(sql1: any, rows2: []) {
        let rows: any = {};
        for (let element of rows2) {
            let rows3: [] = await sql1.executeQueryQuick("SELECT * FROM ide_codeblocks WHERE cat_nameb='" + element["cat_name"] + "' ORDER BY block_cat", []);
            let rows4: {} = {};
            rows3.forEach(element2 => {
                rows4[element2["block_name"]] = element2;
            });
            rows[element["cat_name"]] = [element, rows4];
        }
        return rows;
    }
    */
    private async fetchData(url: string, pdata: Array<JSON>): Promise<string> {
        var axios = require('axios');
        var d1:any;
        try{
            d1 = await axios.post(url,pdata);
            return d1.data;
        }catch(error) {
                console.log(error);
            }
        return '{}';
    }
    public treeItemClick(item: TreeItem){
        const editor = vscode.window.activeTextEditor;
        //console.log(this.codeBlocks);
        if(editor){
            const snippet = new vscode.SnippetString();
            let codeb = this.codeBlocks[item.parentb][1][item.aname]["block_code"];
            snippet.value = codeb;
            //snippet.appendTabstop();
            editor.insertSnippet(snippet);           
        }
    }
    public async addBlocks() {
        registerDrop(this._context, this);
        await this.genBlocksTree1(false);
    }

    public async genBlocksTree1(overwrite: boolean = false){
        //let sql1 = new SqlliteSphp(this._context.asAbsolutePath("ideweb.db"));
        //let rows2:[] = await sql1.executeQueryQuick("SELECT * FROM ide_codeblockscat",[]);
        //this.codeBlocks = await this.array2TreeItems(sql1,rows2);
        var p1 = this._context.asAbsolutePath('cb.txt');
        if(overwrite || ! fs.existsSync(p1)){
            this.codeBlocks = await this.fetchData("https://sartajphp.com/help-blocks.html", []);
            fs.writeFileSync(p1,JSON.stringify(this.codeBlocks));
        }else{
            this.codeBlocks = JSON.parse(fs.readFileSync(p1).toString());
        }
        await this.genBlocksTree2();
    }
    private async genBlocksTree2(){
        const tviewM = new TviewM();
        const dp1: any = tviewM.getBlocks(this.codeBlocks,this._context);
        //const tView = vscode.window.registerTreeDataProvider("SartajPHP",codeManager.addT());
        const tView = vscode.window.createTreeView("sartajphp-blocks",
            {
                treeDataProvider: dp1,
                canSelectMany: false,
                dragAndDropController: dp1
            });
            this._context.subscriptions.push(tView);

    }
    private async genCompPropTree(comprop:any){
        const tviewM = new TviewM();
        const dp1: any = tviewM.getDbView(comprop,this._context);
        //const tView = vscode.window.registerTreeDataProvider("SartajPHP",codeManager.addT());
        const tView = vscode.window.createTreeView("sartajphp-comp",
            {
                treeDataProvider: dp1,
                canSelectMany: false,
                dragAndDropController: dp1
            });
            this._context.subscriptions.push(tView);

    }

    private getCompProp(tagid: string,compcode: string) {
        const self = this;
        self.runPhpScriptTimeLimit(self._executablePath, ['-f', self._context.asAbsolutePath("scripts/proj_comp_prop.php"), '--', self._workspaceFolder,compcode,tagid], function (str: string) {
            //console.log(str);
            self.genCompPropTree(JSON.parse(str));
            //vscode.window.showInformationMessage("Comp Prop Updated!");
        });
    }

    private findTag(str1:string, pos:number = 0): string{
        var char = "";
        var start = -1;
        var end = -1;
        for (let index = pos; index < str1.length; index--) {
            char = str1[index];
            if(char === '<'){
                start = index;
                break;
            } 
            if(char === '>') {
                break;
            }                
        }
        if(start > -1){
            for (let index = start+1; index < str1.length; index++) {
                char = str1[index];
                if(char === '>'){
                    end = index;
                    break;
                } 
                if(char === '"'){
                   //ignore
                   for (let index2 = index+1; index2 < str1.length; index2++) {
                        if(str1[index2] === '"'){
                            index = index2;
                            break;
                        }
                   } 
                }
                if(char === "'"){
                    //ignore
                    for (let index2 = index+1; index2 < str1.length; index2++) {
                         if(str1[index2] === "'"){
                            index = index2;
                             break;
                         }
                    } 
                 }
                 if(char === '<'){
                     break;
                }                
            }
            if(end > -1){    
                return str1.substring(start+1,end);
            }else{
                return "";
            }
        }
        return "";
    }

    private isFileExt(editor:vscode.TextEditor, extc:string): boolean {
        if(editor){
            var ext = extname(editor.document.fileName).toLowerCase();
            if(extc.indexOf(ext)>-1){
                return true;
            }else{
                return false;
            }
        }
        return false;
    }

    public async fillCompProp(d: vscode.TextEditorSelectionChangeEvent){
        let editor = vscode.window.activeTextEditor;
        //ONLY FRONT FILE EXTENSION
        if(editor && this.isFileExt(editor,'.front,.temp')){
            var doc: vscode.TextDocument = d.textEditor.document;
            var str1 = doc.getText();
            var tag = this.findTag(str1,doc.offsetAt(editor.selection.active));
            if (tag !== "") {
                let taga = tag.split(' ');
                let blnComp = false;
                //let attributes:any = {};
                //let tagName = taga[0];
                let tagid = "";
                for(let index=1; index<taga.length; index++){
                    let v1 = taga[index].split('=');
                    if(v1[0] === 'runat'){
                        blnComp = true;
                    }
                    if(v1[0] === 'id'){
                        tagid = v1[1].substring(1,v1[1].length - 1);
                    }
                    /*
                    if(v1.length > 1){
                        attributes[v1[0]] = v1[1];
                    }else{
                        attributes[v1[0]] = '';
                    }
                    */
                }
                // if component then fill properties
                if(blnComp){
                    this.getCompProp(tagid,'<' + tag + '>');
                    //console.log(tag);
                    //console.log(attributes);
                }
            }
        }
    }
    

    private async runPhpScriptTimeLimit(filepath: string, param: Array<string>, callback: any) {
        let strout = "";
        const childProcess = spawn(filepath, param);
        childProcess.stderr.on('data', (chunk: Buffer) => {
            const str = chunk.toString();
            console.log('SartajPHP Lib Error:', str);
            this._client.outputChannel.appendLine(str);
        });
        childProcess.stdout.on('data', (chunk: Buffer) => {
            //console.log('SartajPHP Lib:', chunk + '');
            strout += chunk.toString();
        });
        childProcess.on('exit', (code, signal) => {
            callback(strout);
            this._client.outputChannel.appendLine(
                `SartajPHP Lib ` + (signal ? `from signal ${signal}` : `with exit code ${code}`)
            );
            if (code !== 0) {
                this._client.outputChannel.show();
            }
        });

    }

    private async runPhpScript(filepath: string, param: Array<string>) {
        const childProcess = spawn(filepath, param);
        childProcess.stderr.on('data', (chunk: Buffer) => {
            const str = chunk.toString();
            console.log('SartajPHP Lib Error:', str);
            this._client.outputChannel.appendLine(str);
        });
        childProcess.stdout.on('data', (chunk: Buffer) => {
            console.log('SartajPHP Lib:', chunk + '');
        });
        childProcess.on('exit', (code, signal) => {
            this._client.outputChannel.appendLine(
                `SartajPHP Lib ` + (signal ? `from signal ${signal}` : `with exit code ${code}`)
            );
            if (code !== 0) {
                this._client.outputChannel.show();
            }
        });

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
                this.executeCommand(fileExtension);
            });
            /*
                            return this._document.save().then(() => {
                                this.executeCommand(executor, appendFile);
                            });
                            */
        }
    }

    private executeCommand(fileExtension: string) {
        let command: string = this._executablePath + " -f " + this._cwd + "/start.php -- --ctrl index";
        //check sphp file exist
        if (fs.existsSync(this._cwd + "/app.sphp") && fileExtension !== ".phar") {
            let sphpfile = JSON.parse(fs.readFileSync(this._cwd + "/app.sphp").toString());
            //var ppath = (process.platform == 'darwin' ? 'sphpserver-mac' : process.platform == 'win32' ? 'sphpserver-win.exe' : 'sphpserver-linux');
            //var bpath = path.resolve(path.dirname(require.main!.filename) + "/../"); 
            //command = bpath + "/vendor/sartajphp/sartajphp/res/sphpserver/" + ppath + " " + this._cwd + "/sapp.sphp";
            //command = "php -f " + this._cwd + "/start.php -- --ctrl index";
            if (sphpfile["type"] !== undefined) {
                switch (sphpfile["type"]) {
                    case "srvapp": {
                        command = this._sphpExecutablePath + " --proj " + this._cwd;
                        break;
                    }
                    case "deskapp": {
                        command = this._sphpExecutablePath + " " + this._cwd + "/app.sphp";
                        break;
                    }
                    case "consoleapp": {
                        command = this._executablePath + " -f " + this._cwd + "/start.php -- --ctrl index";
                        break;
                    }
                    default: {
                        command = this._executablePath + " -f " + this._cwd + "/start.php -- --ctrl index";
                        break;
                    }
                }

            } else {
                command = this._executablePath + " -f " + this._cwd + "/start.php -- --ctrl index";
            }
        } else if (fileExtension === ".phar") {
            command = this._sphpExecutablePath + ' ' + this._document.fileName;
        } else {
            command = this._executablePath + " -f " + this._cwd + "/start.php -- --ctrl index";
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



