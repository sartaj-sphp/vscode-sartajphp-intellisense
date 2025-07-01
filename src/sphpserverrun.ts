"use strict";

//import * as path from 'path';
import * as net from 'net';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

export class SphpServerRun {
  private cmd: string;
  public host: string;
  public port: number;
  public ssl: number;
  public www: string;
  public ls: ChildProcessWithoutNullStreams | null;
  public status: boolean;

  constructor(sphpexecutablePath: string) {
    this.cmd = sphpexecutablePath;  }

  private async isPortFree(host: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = net.createConnection({ host, port });

      socket.on('connect', () => {
        socket.end();
        resolve(false); // Port is in use
      });

      socket.on('error', () => {
        resolve(true); // Port is free
      });
    });
  }

  private async findFreePort(host: string = 'localhost', start = 8000, end = 8100): Promise<number> {
    for (let port = start; port < end; port++) {
      if (await this.isPortFree(host, port)) {
        return port;
      }
    }
    throw new Error('No free port found');
  }

  public async runServer(
    host: string = '127.0.0.1',
    port: number = 0,
    ssl: number = 0,
    www: string = '',
    edtctrl: string = '',
  ) {
    let ls: ChildProcessWithoutNullStreams | null = null;

    try {
      if (port === 0) {
        port = await this.findFreePort(host);
      }

      ls = spawn(this.cmd, ['--proj', www, '--host', host, '--port', port.toString(), '--ssl', ssl.toString(),'--edtmode','1','--edtctrl', edtctrl]);
      this.host = host;
      this.port = port;
      this.ssl = ssl;
      this.www = www;
      this.ls = ls;
      this.status = true;

      //ls.stdin.setEncoding('utf-8');
      ls.stdout.setEncoding('utf-8');

      ls.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      ls.stderr.on('data', (data) => {
        console.error('stderr: ' + data.toString());
      });

      ls.on('exit', (code, signal) => {
        console.log(`SphpServer exited with code ${code}, signal ${signal}`);
        this.status = false;
        //process.exit();
      });

//      return { host, port, SphpServer: ls };
    } catch (error) {
      console.error('Failed to start SphpServer:', error);
      this.status = false;
      //process.exit(1);
    }

    //return { host, port, SphpServer: ls };
  }
}
