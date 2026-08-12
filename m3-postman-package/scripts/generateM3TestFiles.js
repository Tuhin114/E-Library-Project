/**
 * Generates all local files required by the Milestone 3 Postman tests.
 *
 * Usage:
 *   node scripts/generateM3TestFiles.js
 *
 * Requires:
 *   npm install sharp
 *
 * The generated files are written to:
 *   postman/m3-test-files/
 *
 * Notes:
 * - The generated JPEG/PNG/WebP are valid image files.
 * - The GIF/SVG/TXT/DOCX/MP3 files are intentionally invalid for the
 *   corresponding M3 upload rules.
 * - oversized-cover.jpg is >5MB.
 * - oversized-book.pdf is >50MB.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.resolve(__dirname, "../postman/m3-test-files");

fs.mkdirSync(outDir, { recursive: true });

const write = (name, data) => fs.writeFileSync(path.join(outDir, name), data);

const image = await sharp({
  create: {
    width: 64,
    height: 64,
    channels: 3,
    background: { r: 120, g: 180, b: 220 }
  }
});

await image.jpeg({ quality: 90 }).toFile(path.join(outDir, "cover-valid.jpg"));
await image.png().toFile(path.join(outDir, "cover-valid.png"));
await image.webp({ quality: 90 }).toFile(path.join(outDir, "cover-valid.webp"));

write("cover-invalid.gif", Buffer.concat([Buffer.from("GIF89a"), Buffer.alloc(100)]));
write(
  "cover-invalid.svg",
  Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>')
);
write("non-image.txt", Buffer.from("This is intentionally not an image.\n"));

write("valid-book.pdf", Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 100] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 12 Tf 20 50 Td (M3 test PDF) Tj ET
endstream
endobj
%%EOF
`));

const zip = new JSZip();
zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
zip.file(
  "META-INF/container.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`
);
zip.file(
  "OEBPS/content.opf",
  `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="bookid">m3-test</dc:identifier><dc:title>M3 Test EPUB</dc:title><dc:language>en</dc:language>
</metadata>
<manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml"/></manifest>
<spine><itemref idref="nav"/></spine>
</package>`
);
zip.file(
  "OEBPS/nav.xhtml",
  `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"><body><h1>M3 Test EPUB</h1></body></html>`
);
write("valid-book.epub", await zip.generateAsync({ type: "nodebuffer" }));

write("invalid-book.mp3", Buffer.concat([Buffer.from("ID3"), Buffer.alloc(1024)]));
write("wrong-type.docx", Buffer.from("M3 intentionally wrong document type"));

const oversizedCover = path.join(outDir, "oversized-cover.jpg");
const coverWidth = 2400;
const coverHeight = 2400;
const rawPixels = Buffer.alloc(coverWidth * coverHeight * 3);
for (let i = 0; i < rawPixels.length; i++) {
  // Deterministic pseudo-random noise prevents JPEG compression from
  // shrinking the file below Multer's 5MB limit.
  rawPixels[i] = (i * 31 + 17) % 256;
}
await sharp(rawPixels, {
  raw: {
    width: coverWidth,
    height: coverHeight,
    channels: 3
  }
}).jpeg({ quality: 100 }).toFile(oversizedCover);

const oversizedCoverSize = fs.statSync(oversizedCover).size;
if (oversizedCoverSize <= 5 * 1024 * 1024) {
  throw new Error(
    `oversized-cover.jpg is only ${oversizedCoverSize} bytes; expected > 5MB`
  );
}

const oversizedPdf = path.join(outDir, "oversized-book.pdf");
const stream = fs.createWriteStream(oversizedPdf);
stream.write(Buffer.from("%PDF-1.4\n% M3 oversized test\n"));
const chunk = Buffer.alloc(1024 * 1024, "0");
for (let i = 0; i < 51; i++) stream.write(chunk);
await new Promise((resolve, reject) => {
  stream.end(resolve);
  stream.on("error", reject);
});

console.log(`Generated M3 test files in: ${outDir}`);
for (const file of fs.readdirSync(outDir)) {
  const size = fs.statSync(path.join(outDir, file)).size;
  console.log(`${file.padEnd(24)} ${(size / 1024 / 1024).toFixed(2)} MB`);
}
