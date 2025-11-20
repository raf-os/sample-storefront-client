/** TODO: Finish this */

import type { Path, PathValue, PatchDocument, PatchOperation } from "@/types/jsonPatch";

export class PatchBuilder<T> {
    private patchDoc: Set<PatchOperation<T>> = new Set();

    replace<P extends Path<T>>(path: P, value: PathValue<T, P>) {
        this.patchDoc.add({ op: 'replace' as const, path, value });
    }

    add<P extends Path<T>>(path: P, value: any) {
        this.patchDoc.add({ op: 'add' as const, path, value });
    }

    remove<P extends Path<T>>(path: P) {
        this.patchDoc.add({ op: 'remove' as const, path });
    }

    copy<P extends Path<T>>(from: P, path: P) {
        this.patchDoc.add({ op: 'copy' as const, from, path });
    }

    move<P extends Path<T>>(from: P, path: P) {
        this.patchDoc.add({ op: 'move' as const, from, path });
    }

    test<P extends Path<T>>(path: P, value: PathValue<T, P>) {
        this.patchDoc.add({ op: 'test' as const, path, value });
    }

    build() { return this.patchDoc };

    parseObject(obj: T) {
    }
}

function createPatch<T>() {
    return {
        replace: <P extends Path<T>>(path: P, value: PathValue<T, P>) => 
            ({ op: 'replace' as const, path, value }),
        
        add: <P extends Path<T>>(path: P | `${P}/-`, value: any) => 
            ({ op: 'add' as const, path, value }),
        
        remove: <P extends Path<T>>(path: P) => 
            ({ op: 'remove' as const, path }),
        
        copy: <P extends Path<T>>(from: P, path: P) => 
            ({ op: 'copy' as const, from, path }),
        
        move: <P extends Path<T>>(from: P, path: P) => 
            ({ op: 'move' as const, from, path }),
        
        test: <P extends Path<T>>(path: P, value: PathValue<T, P>) => 
            ({ op: 'test' as const, path, value }),
    };
}