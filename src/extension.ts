import * as path from 'path';
import * as vscode from 'vscode';
import { Disposable } from 'vscode-languageclient/node';
import { CodeManager } from "./codeManager";
import { AutoCompleteFront } from "./autoCompleteFront";
import { TreeItem } from "./treeitem";

let _autoCompleteFront: AutoCompleteFront;
let codeManager: CodeManager;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    /*
    const conf2 = vscode.workspace.getConfiguration('files.associations');
    //conf2.set("*.app", "php");
    if(conf2.has("*.app")){
    }else{
        console.log(' nnnn ');
    }
    */
    const conf = vscode.workspace.getConfiguration('php');
    const executablePath =
        conf.get<string>('executablePath') ||
        (process.platform === 'win32' ? 'php' : 'php');
    const sphpExecutablePath =
    conf.get<string>('sphpExecutablePath') ||
    (process.platform === 'win32' ? 'sphpdesk' : 'sphpdesk');
    const sphpServerExecutablePath = conf.get<string>('sphpServerExecutablePath') ||
    (process.platform === 'win32' ? 'C:\\sphpdesk\\sphpserver\\sphpserver-win.exe' : '/home/sphpdesk/sphpserver/sphpdesk-linux');
    
    const resPath = context.asAbsolutePath(
        path.join('vendor', 'sartajphp', 'sartajphp', 'res')
    );
    codeManager = new CodeManager(context,resPath,executablePath,sphpExecutablePath,sphpServerExecutablePath);
    vscode.window.onDidCloseTerminal(() => {
        codeManager.onDidCloseTerminal();
    });

    const run = vscode.commands.registerCommand("sphp-runner.run", (fileUri: vscode.Uri) => {
        codeManager.run(fileUri);
    });

    const stop:Disposable = vscode.commands.registerCommand("sphp-runner.stop", () => {
        codeManager.stop();
    });

    const projCreate = vscode.commands.registerCommand("sphp-proj.create", () => {
        codeManager.projCreate();
    });

    const projCreateMob = vscode.commands.registerCommand("sphp-proj.createcordova", () => {
        codeManager.projCreateCordova();
    });

    const projDist = vscode.commands.registerCommand("sphp-proj.dist", () => {
        codeManager.projDist();
    });

    const projView = vscode.commands.registerCommand("sphp-proj.view", () => {
        codeManager.projView();
    });

    const titemClick = vscode.commands.registerCommand("sphp-item.click", (item: TreeItem) => {
        codeManager.treeItemClick(item);
    });

    const dbv1 = vscode.commands.registerCommand("sphp-db.view", () => {
        codeManager.dbView();
    });

    const dbv2 = vscode.commands.registerCommand("sphp-db.gen", (item:TreeItem) => {
        codeManager.dbGen(item);
    });

    const dbv3 = vscode.commands.registerCommand("sphp-db.reload", () => {
        codeManager.dbView();
    });

    const dbv4 = vscode.commands.registerCommand("sphp-blocks.reload", () => {
        codeManager.genBlocksTree1(true);
    });

    
    //future use for comp properties window
    vscode.window.onDidChangeTextEditorSelection((d) => {
        codeManager.fillCompProp(d);
    });
    

    codeManager.addBlocks();

    context.subscriptions.push(run);
    context.subscriptions.push(stop);
    context.subscriptions.push(projCreate);
    context.subscriptions.push(projCreateMob);
    context.subscriptions.push(projDist);
    context.subscriptions.push(projView);
    context.subscriptions.push(titemClick);
    context.subscriptions.push(dbv1);
    context.subscriptions.push(dbv2);
    context.subscriptions.push(dbv3);
    context.subscriptions.push(dbv4);
    context.subscriptions.push(codeManager);
    //auto complete
    _autoCompleteFront = new AutoCompleteFront(codeManager);
    context.subscriptions.push(_autoCompleteFront);
}

export function deactivate() {
  _autoCompleteFront?.dispose();
  codeManager?.dispose();
}

