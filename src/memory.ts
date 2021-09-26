import { DiskIO } from "./disk"
import { TDataType } from "./type"

export class MFS extends DiskIO {
    constructor(path?: string, recursive?: boolean) {
        super(path, recursive)

        this.scheduleFileData()
        this.autoSave()
    }

    /**
     *******************************************
     * @description Memory file system session
     *******************************************
     */


    /**
     * @public
     * @description Is exists in memory file system
     * @param path Memory file system path
     * @returns { boolean } Is success
     */
    public isExists(path: string): boolean {
        return this.fileData[path] !== undefined
    }
    
    /**
     * @public
     * @description Write in memory file system
     * @param path Memory file system path
     * @param data Write file system 
     * @returns { boolean } is success
     */
    public write(path: string, data: any): boolean {
        this.fileData[path] = { 
            type: typeof data, 
            data,
            accessTime: this.getAccessTime()
        }
        return true
    }
    
    /**
     * @public
     * @description Read in memory file system
     * @param path Memory file system path (if undefined try load IO)
     * @returns { any } same type when write data.
     */
    public read(path: string) {
        if (this.fileData[path] === undefined) {
            this.loadDisk(path, { recursive: false })
        } else {
            this.fileData[path].accessTime = this.getAccessTime()
        }
        return this.fileData[path]?.data
    }

    /**
     * @public
     * @description Get data type in memory file system
     * @param path Memory file system path
     * @returns { TDataType } data type
     */
    public getType(path: string): TDataType {
        return this.fileData[path]?.type
    }


    /**
     * @public
     * @description Clear data in memory file system 
     * @param path Memory file system path (not required, if undefined clear all)
     * @returns { void } void
     */
    public clear(path?: string) {
        if (path === undefined) {
            for (const inPath in this.fileData) {
                delete this.fileData[inPath]
            }
        } else {
            delete this.fileData[path]
        }
    }


    /**
     *******************************************
     * @description Memory file system auto system sesssion
     *******************************************
     */


    /**
     * @private
     * @description Automatically save to disk every 5 minutes
     * @returns { void } void
     */
    private autoSave() {
        setInterval(this.saveDiskAll, 1000 * 10)
    }

    
    /**
     * @private
     * @description Data that has not been accessed for 5 minutes is automatically removed from memory.
     * @returns { void } void
     */
    private scheduleFileData() {
        const min5 = 1000 * 60 * 5
        setInterval(()=>{
            const stdTime = this.getAccessTime()
            for (const path in this.fileData) {
                if (this.fileData[path].accessTime  + min5 < stdTime) {
                    this.saveDisk(path)
                    delete this.fileData[path]
                }
            }
        }, min5)   
    }

}