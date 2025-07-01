"use strict";

import * as vscode from "vscode";
import { CodeManager } from "./codeManager";

export class AutoCompleteFront implements vscode.Disposable {
    private _cm:CodeManager;
  private disposable: vscode.Disposable;
    constructor(cm:CodeManager) {
        let self = this;
        this._cm = cm;
    this.disposable = vscode.languages.registerCompletionItemProvider(
      { language: 'html', scheme: 'file' },
      {
        provideCompletionItems(document, position, token, context) {
            return new Promise(resolve => {
          const line = document.lineAt(position).text;
          //const char = line[position.character - 1];
           let items ;
          if (/\w+="?$/.test(line.substring(0, position.character))) {
            items = AutoCompleteFront.getAttributeValueSuggestions(line, position);
            resolve(items);
          } else {
            var pos = document.offsetAt(position);
            var dif = 200;
                if(pos < 200){
                    dif = pos;
                }
                var str1 = document.getText().substring(pos-dif,pos+200);

            let tag1 = self._cm.getCompTag(str1, dif);
            if(tag1[0] !== ''){
                //vscode.window.showInformationMessage("tag " + tag1[0]);
                self._cm.getCompProp(tag1[1]['id'],'<' + tag1[0] + '>',function(ar1:any){
                    items = AutoCompleteFront.getAttributeNameSuggestions(ar1,tag1[1]);
                    resolve(items);                        
                });
            }else{
                items = AutoCompleteFront.getAttributeNameSuggestions({},{});
                resolve(items);
            }
       
          }
           });
        }
      },
      '"', '=' // trigger characters
    );
  }

  public dispose() {
    this.disposable.dispose();
  }

  private static getAttributeNameSuggestions(avail:any,prevattr:any): vscode.CompletionItem[] {
    const attributes = ['runat','dfield', 'dtable', 'id'];
    //vscode.window.showInformationMessage("attributes " + Object.keys(avail).length);
    let comp = "";
    // not implement delete used attributes
    var items:any = []; 
    attributes.forEach(attr => {
      if(prevattr[attr] !== undefined){ return;}
      const item = new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property);
      item.insertText = attr + '="${1}"';
      item.documentation = 'SartajPhp Object Attributes';
      items.push(item);
    });
    Object.keys(avail).forEach((attr) => {
        if(attr.substring(0,5) === "comp#"){
          comp = attr.substring(5);
        }else{
          if((prevattr["fui" +attr] !== undefined) || (prevattr["fun" + attr] !== undefined) || (prevattr["fur" + attr] !== undefined)){ return;}

        const item = new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property);
        item.documentation = 'SartajPhp Object: ' + comp;
        let param = "";
        Object.keys(avail[attr][1]).forEach((index2:string) => {
        item.documentation += "\n" + index2;
        if(index2 !== "Method"){
          param = index2.substring(1,index2.length - 1);
          param = param.replace(/,/g,",|");
        }
        });
        item.insertText = "fun" + attr + '="' + param + '"';
        items.push(item);
      }
      
    });
    return items;
  }

  private static getAttributeValueSuggestions(line: string, position: vscode.Position): vscode.CompletionItem[] {
    // Extract the attribute name before cursor
    const attrMatch = line.slice(0, position.character).match(/(\w+)\s*=\s*"?$/);
    const attrName = attrMatch?.[1];

    if (!attrName){ return [];}

    let values: string[] = [];

    switch (attrName) {
      case 'runat':
        values = ['server', 'client'];
        break;
      case 'dfield':
        values = []; // fill from database
        break;
      case 'dtable':
        values = []; // fill from database
        break;
      // Add more attributes as needed
      default:
        return [];
    }

    return values.map(value => {
      const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
      item.insertText = value;
      return item;
    });
  }


}
