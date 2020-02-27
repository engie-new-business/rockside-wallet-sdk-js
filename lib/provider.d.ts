import { Wallet } from './wallet';
import { Rockside } from './rockside';
export declare class Provider {
    private engine;
    constructor(rockside: Rockside, wallet?: Wallet, identity?: string);
    send(method: string | any, parameters: ((error: Error | null, result?: any) => void) | any): Promise<string> | void;
}
