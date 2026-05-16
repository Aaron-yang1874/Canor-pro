import * as Y from 'yjs';

export interface CRDTDoc {
  doc: Y.Doc;
  textFields: Map<string, Y.Text>;
  initTextField(name: string): Y.Text;
  getText(name: string): Y.Text | undefined;
  updateText(name: string, update: Uint8Array): void;
  onUpdate(callback: (update: Uint8Array) => void): void;
}

export function createCRDTDoc(): CRDTDoc {
  const doc = new Y.Doc();
  
  const crdtDoc: CRDTDoc = {
    doc,
    textFields: new Map(),
    
    initTextField(name: string): Y.Text {
      if (this.textFields.has(name)) {
        return this.textFields.get(name)!;
      }
      const text = this.doc.getText(name);
      this.textFields.set(name, text);
      return text;
    },
    
    getText(name: string): Y.Text | undefined {
      return this.textFields.get(name);
    },
    
    updateText(name: string, update: Uint8Array): void {
      Y.applyUpdate(this.doc, update);
    },
    
    onUpdate(callback: (update: Uint8Array) => void): void {
      this.doc.on('update', (update: Uint8Array) => {
        callback(update);
      });
    }
  };
  
  return crdtDoc;
}
