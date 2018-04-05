export interface InvokationArgs {
    preamble(): string[];
    createServer(): string[];
    startServer(): string[];
}
