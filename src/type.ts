
export type TDataType = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";

export interface TFileSystemObject {
    type: TDataType;
    data: any;
    accessTime: number;
}
