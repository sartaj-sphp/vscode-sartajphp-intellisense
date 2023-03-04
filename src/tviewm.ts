import * as vscode from "vscode";
import { TdataProvider } from "./tdataprovider";


export class TviewM implements vscode.Disposable {

    public getBlocks(rows:any,context: vscode.ExtensionContext) : vscode.TreeDataProvider<any> {
        return new TdataProvider(rows,context,'a');
    }

    public getDbView(rows:any,context: vscode.ExtensionContext) : vscode.TreeDataProvider<any> {
        return new TdataProvider(rows,context);
    }

    public dispose() {
    }

}

 
