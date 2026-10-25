import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { PresentationFile, FileBlob } = await import(pathToFileURL('C:/Users/corsi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs').href);
const p = await PresentationFile.importPptx(await FileBlob.load('C:/Users/corsi/Documents/scm- Copy/.ppt_out/Student-Council-Management-System-3ft-by-8ft-Editable-Poster.pptx'));
const slide = p.slides.items[0];
const img = await p.export({ slide, format:'png', scale:1 });
await fs.writeFile('C:/Users/corsi/Documents/scm- Copy/.ppt_build/stage/editable-poster-3ft-by-8ft-preview.png',new Uint8Array(await img.arrayBuffer()));
