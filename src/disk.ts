import { resolve, join } from 'path'
import { readdirSync, readFileSync, existsSync, writeFileSync, statSync } from 'fs'
import { TFileSystemObject } from './type';


export class DiskIO {
    /**
     *******************************************
     * @description Disk file systeem session
     *******************************************
     */
    protected readonly fileData: Record<string, TFileSystemObject>;

    constructor (path?: string, recursive?: boolean) {
        this.fileData = {}
        
        if (path !== undefined) {
            this.loadDisk(path, { recursive })
        }
    }

    /**
     * @protected
     * @description Get current time
     * @returns { number } Current time (in ms)
     */

    protected getAccessTime() {
        const date = new Date()
        return date.getTime()
    }

    /**
     * @private
     * @description Read disk
     * @param path Real disk path
     * @returns { TFileSystemObject } TFileSystemObject
     */

    private readDisk(path: string): TFileSystemObject {
        if (!existsSync(path)) {
            return undefined;
        }
        const originData = readFileSync(path).toString()

        try {
            return { data: JSON.parse(originData), type: 'object', accessTime: this.getAccessTime() }
        } catch {}

        const number = Number(originData)
        if (!isNaN(number)) {
            return { data: number, type: 'number', accessTime: this.getAccessTime() }
        }

        return { data: originData, type: 'string', accessTime: this.getAccessTime() }

    }


    /**
     * @private
     * @description Read disk
     * @param path Real disk path
     * @returns { TFileSystemObject } TFileSystemObject
     */
    private setFileData(path: string, { recursive }: { recursive: boolean }) {
        const dirList = readdirSync(path, { withFileTypes: true })

        for (const fileData of dirList) {
            const fileName = fileData.name
            const absPath = resolve(join(path, fileName))
            if (fileData.isDirectory() && recursive) {
                this.setFileData(absPath, { recursive })
            } else {
                this.fileData[absPath] = this.readDisk(absPath)
            }
        }
    } 

    /**
     * @private
     * @description Read disk
     * @param path Real disk path
     * @returns { TFileSystemObject } TFileSystemObject
     */
    public loadDisk(path: string, options: { recursive?: boolean } = {}) {
        const fileStat = statSync(path)
        if (fileStat.isDirectory()) {
            this.setFileData(path, { recursive: (options.recursive ?? false)})
        } else {
            this.fileData[path] = this.readDisk(path)
        }
    }

    /**
     * @public
     * @description Save data to disk.
     * @param path Real disk path
     * @returns { void } void
     */
    public saveDisk(path: string) {
        const originData = this.fileData[path]?.data

        const data: string = (()=>{
            switch(typeof originData) {
                case 'string': {
                    return originData
                }
                case 'object': {
                    return JSON.stringify(originData)
                }
                case 'undefined': {
                    return 'undefined'
                }
                default: {
                    return originData?.toString()
                }
            }
        })()

        writeFileSync(path, data)
    }

    /**
     * @public
     * @description Save all data to disk.
     * @returns { void } void
     */
    public saveDiskAll() {
        for (const path in this.fileData) {
            this.saveDisk(path)
        }
    }
}