"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertStorageObject2Dot = exports.convertStorage2Dot = void 0;
const converterClasses2Storage_1 = require("./converterClasses2Storage");
const debug = require('debug')('sol2uml');
const convertStorage2Dot = (storageObjects) => {
    let dotString = `
digraph StorageDiagram {
rankdir=LR
color=black
arrowhead=open
node [shape=record, style=filled, fillcolor=gray95]`;
    // process contract and the struct objects
    storageObjects.forEach((storageObject) => {
        dotString = convertStorageObject2Dot(storageObject, dotString);
    });
    // link contract and structs to structs
    storageObjects.forEach((slot) => {
        slot.storages.forEach((storage) => {
            if (storage.structObjectId) {
                dotString += `\n ${slot.id}:${storage.id} -> ${storage.structObjectId}`;
            }
        });
    });
    // Need to close off the last digraph
    dotString += '\n}';
    debug(dotString);
    return dotString;
};
exports.convertStorage2Dot = convertStorage2Dot;
function convertStorageObject2Dot(storageObject, dotString) {
    const steorotype = storageObject.type === converterClasses2Storage_1.StorageType.Struct ? 'Struct' : 'Contract';
    // write object header with name and optional address
    dotString += `\n${storageObject.id} [label="{\\<\\<${steorotype}\\>\\>\\n${storageObject.name}\\n${storageObject.address || ''} | `;
    // write slot numbers
    storageObject.storages.forEach((storage, i) => {
        if (i === 0) {
            dotString += `{slot | 0`;
        }
        else if (storage.byteOffset === 0) {
            if (storage.fromSlot === storage.toSlot) {
                dotString += `| ${storage.fromSlot}`;
            }
            else {
                dotString += `| ${storage.fromSlot}-${storage.toSlot}`;
            }
        }
    });
    // write storage types
    storageObject.storages.forEach((storage, i) => {
        const lastStorage = i > 0 ? storageObject.storages[i - 1] : undefined;
        const nextStorage = i + 1 < storageObject.storages.length
            ? storageObject.storages[i + 1]
            : undefined;
        if (i === 0) {
            const contractVaraiblePrefix = storageObject.type === converterClasses2Storage_1.StorageType.Contract
                ? '\\<inherited contract\\>.'
                : '';
            dotString += `} | {type: ${contractVaraiblePrefix}variable (bytes) `;
        }
        // if next storage is in the same slot
        // and storage is the first in the slot
        if (nextStorage?.fromSlot === storage.fromSlot &&
            storage.byteOffset === 0) {
            dotString += `| { ${dotVariable(storage, storageObject.name)} `;
            return;
        }
        // if last storage was on the same slot
        // and the next storage is on a different slot
        if (lastStorage?.fromSlot === storage.fromSlot &&
            (nextStorage?.fromSlot > storage.fromSlot ||
                nextStorage === undefined)) {
            dotString += `| ${dotVariable(storage, storageObject.name)} } `;
            return;
        }
        // If storage covers a whole slot or is not at the start or end of a slot
        dotString += `| ${dotVariable(storage, storageObject.name)} `;
    });
    // Need to close off the last label
    dotString += '}}"]\n';
    return dotString;
}
exports.convertStorageObject2Dot = convertStorageObject2Dot;
const dotVariable = (storage, contractName) => {
    const port = storage.structObjectId !== undefined ? `<${storage.id}>` : '';
    const contractNamePrefix = storage.contractName !== contractName ? `${storage.contractName}.` : '';
    return `${port} ${storage.type}: ${contractNamePrefix}${storage.variable} (${storage.byteSize})`;
};
//# sourceMappingURL=converterStorage2Dot.js.map