"use strict";
import * as fs from "fs";
//import * as os from "os";
import * as path from "path";
import { extname } from "path";
import { spawn } from 'child_process';
import * as vscode from "vscode";
import { AppInsightsClient } from "./appInsightsClient";
import { SphpServerRun } from "./sphpserverrun";
import { TviewM } from "./tviewm";
import { registerDrop } from "./dropprovider";
import { TreeItem } from "./treeitem";
//import { SqlliteSphp } from "./sqlitesphp";

//const path = require('path');
//const TMPDIR = os.tmpdir();

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
    //private _config: vscode.WorkspaceConfiguration;
    private _appInsightsClient: AppInsightsClient;
    private _executablePath: string;
    private _sphpExecutablePath: string;
    private _sphpServerExecutablePath: string;
    //private _resPath: string;
    private _context: vscode.ExtensionContext;
    private _outputerror: any;
    private _panel: vscode.WebviewPanel;
    private _panelStatus: boolean = false;
    //for generate code blocks
    private _tView2?: vscode.TreeView<any>;
    private _dp2?: any;
    // fil comp prop
    private _tView1?: vscode.TreeView<any>;
    private _dp1?: any;
    // fil db view
    private _tView3?: vscode.TreeView<any>;
    private _dp3?: any;
    private _sphpServer: any;
    public codeBlocks: any;

    constructor(contx: vscode.ExtensionContext, resPath: string, executablePath: string, sphpExecutablePath: string, sphpServerExecutablePath: string) {
        //this._outputChannel = vscode.window.createOutputChannel("Code");
        this._terminal = null!;
        this._executablePath = executablePath;
        this._sphpExecutablePath = sphpExecutablePath;
        this._sphpServerExecutablePath = sphpServerExecutablePath;
        //this._resPath = resPath;
        this._context = contx;
        this._appInsightsClient = new AppInsightsClient();
        this._sphpServer = null;
        this._outputerror = vscode.window.createOutputChannel("SartajPHP Intelligence");
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
                
                var rows = [];
                try{
                    rows = JSON.parse(str);
                }catch(e){
                    vscode.window.showErrorMessage(str);
                }
                if(!self._dp3){
                    self._dp3 = new TviewM().getDbView(rows,self._context);
                }else{
                    self._dp3.updateData(rows,self._context,'b'); // b for non clickable
                }
                if(!self._tView3){
                    self._tView3 = vscode.window.createTreeView("sartajphp-db",
                {
                    treeDataProvider: self._dp3,
                    canSelectMany: false,
                    dragAndDropController: self._dp3
                });
                self._context.subscriptions.push(self._tView3);
            }
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
    private async openOrFocusFile(filePath: string) {
    try {
        // Convert to proper URI
        const uri = vscode.Uri.file(filePath);
        
        // Check if document is already open
        const existingDoc = vscode.workspace.textDocuments.find(doc => 
            doc.uri.fsPath === uri.fsPath
        );
        
        if (existingDoc) {
            // File is open - focus its tab
            await vscode.window.showTextDocument(existingDoc.uri, { 
                preview: false, 
                preserveFocus: false 
            });
        } else {
            // File not open - open it
            await vscode.window.showTextDocument(uri, { 
                preview: false 
            });
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to open file: ${error}`);
    }
}
// not use
/*
private removeNoise(html:string, pattern:string, removeTag = false, noiseStore:any = {}) {
  let regex = new RegExp(pattern, 'gi');
  let matches = [];
  let match;

  // Collect all matches with offset
  while ((match = regex.exec(html)) !== null) {
    const fullMatch = match[0];
    const contentMatch = match[1] || match[0];
    const index = match.index + (removeTag ? 0 : fullMatch.indexOf(contentMatch));

    matches.push({
      text: removeTag ? fullMatch : contentMatch,
      index: index,
      length: removeTag ? fullMatch.length : contentMatch.length
    });
  }

  // Replace from end to avoid messing up offsets
  for (let i = matches.length - 1; i >= 0; i--) {
    const key = '___noise___' + String(Object.keys(noiseStore).length + 100).padStart(3, ' ');
    const { text, index, length } = matches[i];
    noiseStore[key] = text;
    html = html.slice(0, index) + key + html.slice(index + length);
  }

  return html;
}
  */
//not use
/*
private cleanNoise(htmlContent:string):string {
        const noise = {};
        htmlContent = this.removeNoise(htmlContent,'<!--[\\s\\S]*?-->', false, noise); 
        htmlContent = this.removeNoise(htmlContent, '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>', true, noise);   // CDATA
        htmlContent = this.removeNoise(htmlContent, '<\\s*style[^>]*>[\\s\\S]*?<\\s* /\\s*style\\s*>', false, noise); // style fix space between * / before use
        //htmlContent = this.removeNoise(htmlContent, '<\\s*script[^>]*>([\\s\\S]*?)<\\s* /\\s*script\\s*>', false, noise); // script same in this line also
        //htmlContent = this.removeNoise(htmlContent, '<\\?(?:[\\s\\S]*?)\\?>', true, noise);           // PHP
        //htmlContent = this.removeNoise(htmlContent, '\\{\\w[\\s\\S]*?\\}', true, noise);              // smarty

        //return htmlContent;    
//}
*/
    private getTagAttributesAtPosition(filePath: string, tagStartPos: number): any {
        var t1 = this.readDocument(filePath);
        // for match the charpos
        //var htmlContent = this.cleanNoise(t1[0]); 
        var htmlContent = t1[0]; 
    //fs.writeFileSync("D:/test.html",htmlContent);
        //const document = t1[1];
    var attributes: any = {};
   
    attributes = this.getTagAttributes(htmlContent, tagStartPos);

    return attributes[1];
}

    private async updateHtmlTagByPosition(
    filePath: string,
    tagStartPos: number,
    updates: { [key: string]: string }
    ){
        try{
        var v1 = this.readDocument(filePath);
        const htmlContent = v1[0];
        const document = v1[1];

    // Find the end of the opening tag
    var tag = this.getTagAttributes(htmlContent,tagStartPos);
    if (tag[0] === ""){ return;}
    var tagEndPos = tagStartPos + tag[0].length;
    Object.entries(updates).forEach(([key, value]) => {
        tag[1][key] = value;
    });

    var finalTag = tag[0].split(' ')[0];
    for (const [key, value] of Object.entries(tag[1])) {
        finalTag += ` ${key}="${value}"`;
    }
    finalTag += ">";
    //vscode.window.showInformationMessage(finalTag);
    // Reconstruct the HTML with updated tag
    var str =
        htmlContent.substring(0, tagStartPos) +
        finalTag +
        htmlContent.substring(tagEndPos + 1);
        this.saveDocument1(filePath,str,document);

        }catch(e){
            console.log(e);
        }
}
 
    private readDocument(filePath: string): [string, any] {
        try {
        const uri = vscode.Uri.file(filePath);
        const document = vscode.workspace.textDocuments.find(doc => doc.uri.fsPath === uri.fsPath);
        const content = document ? document.getText() : fs.readFileSync(filePath, 'utf8');
        return [content,document];
        } catch (error) {
        vscode.window.showErrorMessage(`Error reading file: ${error instanceof Error ? error.message : String(error)}`);
        }
        return ["",null];
    }
    private async saveDocument1(filePath: string, updatedContent: string,document?: vscode.TextDocument) {
        try {
        // Apply changes
        if (document) {
            const edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, 
                new vscode.Range(0, 0, document.lineCount, 0), 
                updatedContent);
            await vscode.workspace.applyEdit(edit);
            await document.save();
        } else {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
        }

        } catch (error) {
        vscode.window.showErrorMessage(`Error saving file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    private sendToWV(evt: string,evtp: string = "",bdata:any = {}) {
        this._panel.webview.postMessage({ 
        command: "sendToWV", 
        ctrl: '', 
        evt: evt,
        evtp: evtp,
        bdata: bdata
        });
    }
    private handleWebPanelMessage(message: any) {
        let self = this;
        switch (message.evt) {
            case 'init':
                break;
            case 'openFile':
                this.openOrFocusFile(message.evtp);
                break;
            case 'tagclick':
                var data:any = {};
                data["info"] = {"tagName":"HtmlTag","phpclass":"HtmlTag","selfclosed":true,"charpos": message.evtp,"tempfile":message.bdata.tempfname};
                //data["attr"] = {};
                data["attr"] = self.getTagAttributesAtPosition(message.bdata.tempfname, message.evtp);
                self.sendToWV("compclick",data,{});
                break;
            case 'compclick':
                var compcode = "<" + message.bdata.info.tagName + " " + Object.entries(message.bdata.attr).map(([k, v]) => `${k}="${v}"`).join(' ');
                if(message.bdata.info.selfclosed === true){
                    compcode += " />";
                }else{
                    compcode += "></" + message.bdata.info.tagName + ">";
                }
                //vscode.window.showInformationMessage(compcode);
                var tagid = message.evtp;
                self.runPhpScriptTimeLimit(self._executablePath, ['-f', self._context.asAbsolutePath("scripts/proj_comp_prop.php"), '--', self._workspaceFolder,compcode,tagid], function (str: string) {
                    //console.log(str);
                    var a2 = JSON.parse(str);
                    var a1:any = {};
                    Object.keys(a2).forEach(function (key) {
                        if(key.substring(0,5) !== "comp#"){
                            a1[key] = a2[key];
                        }
                    });
                    self.sendToWV("compclick",message.bdata,a1);
                    //vscode.window.showInformationMessage("Comp Prop Updated!");
                });

                break;
            case 'updateatr':
                if(message.bdata.phpclass === "HtmlTag"){
                    //vscode.window.showInformationMessage(message.bdata.tempfile);
                this.updateHtmlTagByPosition(message.bdata.tempfile, message.bdata.charpos, message.evtp);
                }else{
                this.updateHtmlTagByPosition(message.bdata.tempfile, message.bdata.charpos, message.evtp);
                //this.updateHtmlTagInFile(message.bdata.tempfile, message.bdata.id, message.evtp);
                }
                this.sendToWV("reload");
                break;
            default:
                vscode.window.showErrorMessage(`WebView Error: ${message.evt}`);
                console.error(message.evt);
                break;
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
                    retainContextWhenHidden: true,
                    enableForms: true
                    
                }
            );
            
            this._panel.webview.onDidReceiveMessage(message => this.handleWebPanelMessage(message), null, this._context.subscriptions);
            

            this._panel.onDidDispose(() => {
                //stopServer();
                this._panelStatus = false;
            }, null, this._context.subscriptions);

            //this._panelStatus = true;
        } else {
            //this._panel.webview.
            //vscode.
        }
        const editor = vscode.window.activeTextEditor;
        const self = this;
        if (!this._panelStatus && editor) {
            self._panelStatus = true; // open once
            editor.document.save().then(function () {
                
                /*
                self.runPhpScriptTimeLimit(self._executablePath, ['-f', self._context.asAbsolutePath("scripts/proj_view.php"), '--', editor.document.fileName, self._workspaceFolder], function (str: string) {
                    str = self.fixResourcePaths(str, self._cwd, self._panel.webview); //str;
                    console.log(str);
                    self._panel.webview.html = str;
                    //vscode.window.showInformationMessage("Done Phar Package!");
                });
                */
            if (fs.existsSync(self._sphpServerExecutablePath)){

            if(self.isFileExt(editor,'.front,.temp')){
               self.startServerDesign().then(function () {
                let vall:any = {};
                let srchost = "http://" + self._sphpServer.host + ":" + self._sphpServer.port;
                let url = srchost + "/index.html?proj=" + self._workspaceFolder + "&file=" + editor.document.fileName + "&type=front";
                console.log(url);
                const webviewOrigin = self._panel.webview.asWebviewUri(vscode.Uri.file('')).toString();
                const webviewHost = webviewOrigin.split('/').slice(0, 3).join('/');
                vall['url'] = url;
                vall['srchost'] = srchost;
                vall['webviewHost'] = webviewHost;
                vall['webviewOrigin'] = webviewOrigin;
                // open dev tool
                //setTimeout(() => { vscode.commands.executeCommand('workbench.action.webview.openDeveloperTools');}, 1000);

                self._panel.webview.html = self.renderTemplate(vall);
               });
            }else{
               self._panel.webview.html = 'Please Select a Front File!'; 
            }
        }else{
               self._panel.webview.html = 'Please Install SartajPHP Desktop Runtime! <a href="https://www.sartajphp.com/index-info-downloads.html">https://www.sartajphp.com/index-info-downloads.html</a>'; 
            }
            });
        } else {
            if (this._panelStatus) {
                this._panel.reveal(vscode.ViewColumn.One, true);
            }else{
            vscode.window.showInformationMessage("No code found or selected.");
            }
            return;
        }

    }

    public treeItemCBDrag(dragData: any){
        var self = this;
        if (this._panelStatus) {
            //vscode.window.showInformationMessage("Drag Drop!");
            // only first item pick
            let v1 = {
                "parent": dragData[0].parent,
                "name": dragData[0].name,
                "bc": this.codeBlocks[dragData[0].parent][1][dragData[0].name]["block_code"]
            };
            //let codeb = this.codeBlocks[dragData.parent][1][dragData.name]["block_code"];
            self.sendToWV("dragdrop","",v1);
        }
    }
private renderTemplate(data: Record<string, any>): string {
    const htmlPath = path.join(this._context.extensionPath, 'src', 'webview', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf-8');
    
    // Replace placeholders with actual values
    for (const [key, value] of Object.entries(data)) {
        html = html.replace(new RegExp(`\\$\\{\\{${key}\\}\\}`, 'g'), value);
    }
    
    return html;
}

    private async startServerDesign() {
        if(this._sphpServer === null){
        this._sphpServer = new SphpServerRun(this._sphpServerExecutablePath);
        //await this._sphpServer.runServer("127.0.0.1",0,0,this._context.asAbsolutePath("scripts/projdes/app.sphp"));
        await this._sphpServer.runServer("127.0.0.1",0,0,this._workspaceFolder,this._context.asAbsolutePath("scripts/projdes/editctrl.php"));
        }
    }
// Rewrite all local resource links
 fixResourcePaths(html: string, baseDir: string, webview: vscode.Webview):string {
    return html.replace(/(src|href)=["']([^"']+)["']/g, (match, attr, relativePath) => {
        // Ignore external URLs
        if (relativePath.startsWith("http") || relativePath.startsWith("data:")) {
          return match;
        }
    
        const fullPath = path.join(baseDir, relativePath);
        const uri = webview.asWebviewUri(vscode.Uri.file(fullPath));
        return `${attr}="${uri}"`;
      });
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
        //console.log(" item click " + item.parentb + " " + item.atype + " " + item.aname);
        if(editor && item.atype === 'a'){
            const snippet = new vscode.SnippetString();
            let codeb = this.codeBlocks[item.parentb][1][item.aname]["block_code"];
            snippet.value = codeb;
            //console.log(codeb);
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
        if(!this._dp2){
            this._dp2 = new TviewM().getBlocks(this.codeBlocks, this._context);
            this._dp2.onDragEvent = this.treeItemCBDrag.bind(this);
        }else{
            this._dp2.updateData(this.codeBlocks,this._context,'a'); 
        }
        //const tView = vscode.window.registerTreeDataProvider("SartajPHP",codeManager.addT());
        if(!this._tView2){
            this._tView2 = vscode.window.createTreeView("sartajphp-blocks",
            {
                treeDataProvider: this._dp2,
                canSelectMany: false,
                dragAndDropController: this._dp2
            });
            this._context.subscriptions.push(this._tView2);
        }
    }
    private async genCompPropTree(comprop:any){
        if(!this._dp1){
            this._dp1 = new TviewM().getDbView(comprop, this._context);
        }else{
            this._dp1.updateData(comprop,this._context,'b'); // b for non clickable
        }
        if(!this._tView1){
        //const tView = vscode.window.registerTreeDataProvider("SartajPHP",codeManager.addT());
        this._tView1 = vscode.window.createTreeView("sartajphp-comp",
            {
                treeDataProvider: this._dp1,
                canSelectMany: false,
                dragAndDropController: this._dp1
            });
            this._context.subscriptions.push(this._tView1);
        }
    }

    public getCompProp(tagid: string,compcode: string,callback: (strar:any) => void){ 
        const self = this;
        self.runPhpScriptTimeLimit(self._executablePath, ['-f', self._context.asAbsolutePath("scripts/proj_comp_prop.php"), '--', self._workspaceFolder,compcode,tagid], function (str: string) {
            //console.log(str);
            //self.genCompPropTree(JSON.parse(str));
            callback(JSON.parse(str));
            //vscode.window.showInformationMessage("Comp Prop Updated!");
        });
    }

    public findTag(str1:string, pos:number = 0): string{
        var char = "";
        var start = -1;
        var end = -1;
        if(pos > 0) {
            pos -= 1;
        }
        for (let index = pos; index >= 0 && index < str1.length; index--) {
            char = str1[index];
            if(char === '<'){
                start = index;
                break;
            } 
            if(char === '>'){ 
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
    public getTagAttributes(tagline:string, pos:number = 0): any{
        let tagar:any = {};
        var tag = this.findTag(tagline,pos);
        if (tag !== "") {
            const attrRegex = /([\w:-]+)\s*=\s*("(?:\\.|[^"])*"|'(?:\\.|[^'])*')/g;
            let match: RegExpExecArray | null;

            while ((match = attrRegex.exec(tag)) !== null) {
                const key = match[1];
                // Remove surrounding quotes from value
                const rawValue = match[2];
                const value = rawValue.substring(1, rawValue.length - 1);
                tagar[key] = value;
            }
              return [tag,tagar];
        }else{
            return ["",{}];                
        }
        
    }
    public getCompTag(tagline:string, pos:number = 0): any{
            let tagar:any = {};
            var tag = this.getTagAttributes(tagline,pos);
            if (tag[0] !== "") {
                if(tagar['runat'] === 'server' && tagar['id'] !== ''){
                    return tag;                
                }else{
                    return ["",{}];                
                }
            }else{
                return ["",{}];                
            }
    }
    public async fillCompProp(d: vscode.TextEditorSelectionChangeEvent){
        let self = this;
        let editor = vscode.window.activeTextEditor;
        //ONLY FRONT FILE EXTENSION
        if(editor && this.isFileExt(editor,'.front,.temp')){
            var doc: vscode.TextDocument = d.textEditor.document;
            //var str1 = doc.lineAt(editor.selection.active).text;
            var pos = doc.offsetAt(editor.selection.active);
            var dif = 200;
            if(pos < 200){
                dif = pos;
            }
            var str1 = doc.getText().substring(pos-dif,pos+200);
            var tag = this.getCompTag(str1,dif);
            //vscode.window.showInformationMessage("N " + tag[0]);

            if (tag[0] !== "") {
                // if component then fill properties
                    this.getCompProp(tag[1]['id'],'<' + tag[0] + '>',function(ar1:any){
                        self.genCompPropTree(ar1);
                    });
                    //console.log(tag[0]);
                    //console.log(tag[1]);
                
            }
        }
    }
    

    private async runPhpScriptTimeLimit(filepath: string, param: Array<string>, callback: any) {
        let strout = "";
        const childProcess = spawn(filepath, param);
        childProcess.stderr.on('data', (chunk: Buffer) => {
            const str = chunk.toString();
            //console.error('SartajPHP Lib Error:', str);
            this._outputerror.appendLine(str);
        });
        childProcess.stdout.on('data', (chunk: Buffer) => {
            //console.log('SartajPHP Lib:', chunk + '');
            strout += chunk.toString();
        });
        childProcess.on('exit', (code, signal) => {
            callback(strout);
            this._outputerror.appendLine(
                `SartajPHP Lib ` + (signal ? `from signal ${signal}` : `with exit code ${code}`)
            );
            if (code !== 0) {
                this._outputerror.show();
            }
        });

    }

    private async runPhpScript(filepath: string, param: Array<string>) {
        const childProcess = spawn(filepath, param);
        childProcess.stderr.on('data', (chunk: Buffer) => {
            const str = chunk.toString();
            //console.error('SartajPHP Lib Error:', str);
            this._outputerror.appendLine(str);
        });
        childProcess.stdout.on('data', (chunk: Buffer) => {
            console.log('SartajPHP Lib:', chunk + '');
        });
        childProcess.on('exit', (code, signal) => {
            this._outputerror.appendLine(
                `SartajPHP Lib ` + (signal ? `from signal ${signal}` : `with exit code ${code}`)
            );
            if (code !== 0) {
                this._outputerror.show();
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
        this.initvar();
    }
    private initvar():void{
        this._workspaceFolder = this.getWorkspaceFolder();
        this._cwd = this._workspaceFolder;
        //this._cwd = TMPDIR;
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
        if(this._cwd === undefined){
            this.initvar();
        }
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
        /*
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
        */
        return command;
    }
/*
    private replacer(match: string, p1: string): string {
        return `/mnt/${p1.toLowerCase()}/`;
    }
*/

    private sendRunEvent(executor: string, runFromTerminal: boolean) {
        const properties = {
            runFromTerminal: runFromTerminal.toString(),
            runFromExplorer: this._runFromExplorer.toString(),
            isTmpFile: this._isTmpFile.toString(),
        };
        this._appInsightsClient.sendEvent(executor, properties);
    }
}



