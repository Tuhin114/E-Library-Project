// FILE PATH: backend/src/scripts/seedMockData.js
//
// Seeds:
//   - Users
//   - Categories
//   - Authors
//   - Publishers
//   - 40 Books
//   - Real cover photos (downloaded from Picsum Photos, keyless & deterministic)
//   - PDF files (generated placeholder documents)
//   - EPUB files (generated placeholder documents)
//   - Favorites
//   - Recently Viewed
//
// Book/author/publisher/ISBN data here is synthetic mock data for
// development and testing. Cover images are real downloaded photographs
// rather than generated placeholder art — see fetchRealCoverImage() below.
//
// Usage:
//   node src/scripts/seedMockData.js
//   node src/scripts/seedMockData.js --fresh
//
// WARNING:
// --fresh is intended ONLY for your development/test database.
// It deletes the existing Book/Category/Author/Publisher/Favorite/
// RecentlyViewed data before rebuilding the mock dataset.

import mongoose from "mongoose";
import dotenv from "dotenv";
import zlib from "node:zlib";
import axios from "axios";

import User from "../models/User.js";
import Category from "../models/Category.js";
import Author from "../models/Author.js";
import Publisher from "../models/Publisher.js";
import Book from "../models/Book.js";
import Favorite from "../models/Favorite.js";
import RecentlyViewed from "../models/RecentlyViewed.js";

import { generateSlug } from "../utils/slugify.js";
import { uploadBuffer, deleteAsset } from "../utils/cloudinaryUpload.js";

import { ROLES } from "../constants/roles.js";
import { BOOK_STATUS } from "../constants/bookStatus.js";
import { BOOK_VISIBILITY } from "../constants/bookVisibility.js";
import { FILE_LIMITS } from "../constants/fileUploadLimits.js";

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;
const isFreshRun = process.argv.includes("--fresh");

const TEST_PASSWORD = "Password123!";

const log = (message) => {
  console.log(`[seed] ${message}`);
};

/* -------------------------------------------------------------------------- */
/* USERS                                                                       */
/* -------------------------------------------------------------------------- */

const USERS = [
  {
    name: "Lena Whitmore",
    email: "librarian@elibrary.test",
    role: ROLES.LIBRARIAN,
  },
  {
    name: "Sam Okafor",
    email: "faculty@elibrary.test",
    role: ROLES.FACULTY,
  },
  {
    name: "Priya Nair",
    email: "student1@elibrary.test",
    role: ROLES.STUDENT,
  },
  {
    name: "Diego Ramirez",
    email: "student2@elibrary.test",
    role: ROLES.STUDENT,
  },
];

/* -------------------------------------------------------------------------- */
/* CATEGORIES                                                                  */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  {
    name: "Computer Science",
    description:
      "Programming, algorithms, data structures, and general computing.",
  },
  {
    name: "Artificial Intelligence",
    description:
      "Machine learning, neural networks, NLP, computer vision, and AI.",
  },
  {
    name: "Database Systems",
    description: "SQL, NoSQL, data modeling, storage, and data engineering.",
  },
  {
    name: "Computer Networks",
    description:
      "Networking protocols, distributed communication, and internet systems.",
  },
  {
    name: "Operating Systems",
    description:
      "Processes, memory, filesystems, concurrency, and system software.",
  },
  {
    name: "Web Development",
    description:
      "Frontend, backend, APIs, TypeScript, and modern web applications.",
  },
  {
    name: "Cyber Security",
    description:
      "Application security, cryptography, authentication, and secure systems.",
  },
  {
    name: "Software Engineering",
    description:
      "Architecture, testing, maintainability, design, and engineering practices.",
  },
  {
    name: "Data Science",
    description: "Statistics, analytics, visualization, and data processing.",
  },
  {
    name: "Technology and Society",
    description:
      "Technology, privacy, ethics, digital life, and social impact.",
  },
];

/* -------------------------------------------------------------------------- */
/* AUTHORS                                                                     */
/* -------------------------------------------------------------------------- */

const AUTHORS = [
  {
    name: "Maya Sen",
    nationality: "Indian",
    bio: "Technical educator focused on practical computing and software development.",
  },
  {
    name: "Daniel Brooks",
    nationality: "American",
    bio: "Software engineer writing about reliable backend systems.",
  },
  {
    name: "Aisha Rahman",
    nationality: "Bangladeshi",
    bio: "Technology educator specializing in data and intelligent applications.",
  },
  {
    name: "Noah Bennett",
    nationality: "British",
    bio: "Writer covering networking, operating systems, and infrastructure.",
  },
  {
    name: "Elena Torres",
    nationality: "Spanish",
    bio: "Engineer interested in secure and scalable software.",
  },
  {
    name: "Arjun Mehta",
    nationality: "Indian",
    bio: "Developer and educator focused on web platforms and APIs.",
  },
  {
    name: "Sofia Laurent",
    nationality: "French",
    bio: "Data scientist writing accessible guides to statistics and analytics.",
  },
  {
    name: "Marcus Chen",
    nationality: "Canadian",
    bio: "Computer scientist interested in distributed systems and databases.",
  },
  {
    name: "Nora Williams",
    nationality: "American",
    bio: "Technical author focused on software engineering practices.",
  },
  {
    name: "Kenji Sato",
    nationality: "Japanese",
    bio: "Engineer exploring artificial intelligence and human-computer interaction.",
  },
  {
    name: "Fatima Hassan",
    nationality: "Egyptian",
    bio: "Cybersecurity educator and application security practitioner.",
  },
  {
    name: "Oliver Grant",
    nationality: "Australian",
    bio: "Writer focused on cloud infrastructure and modern development.",
  },
  {
    name: "Riya Kapoor",
    nationality: "Indian",
    bio: "Data engineer working with analytics pipelines and information systems.",
  },
  {
    name: "Lucas Pereira",
    nationality: "Brazilian",
    bio: "Developer interested in practical architecture and distributed applications.",
  },
  {
    name: "Hannah Miller",
    nationality: "German",
    bio: "Research-oriented writer covering technology and society.",
  },
];

/* -------------------------------------------------------------------------- */
/* PUBLISHERS                                                                  */
/* -------------------------------------------------------------------------- */

const PUBLISHERS = [
  {
    name: "Northstar Academic Press",
    country: "India",
    website: "https://example.com/northstar",
  },
  {
    name: "BlueOak Technical Books",
    country: "United States",
    website: "https://example.com/blueoak",
  },
  {
    name: "Riverstone Digital Press",
    country: "United Kingdom",
    website: "https://example.com/riverstone",
  },
  {
    name: "Atlas Learning House",
    country: "Canada",
    website: "https://example.com/atlas",
  },
  {
    name: "Open Circuit Publishing",
    country: "Australia",
    website: "https://example.com/opencircuit",
  },
  {
    name: "Summit Knowledge Works",
    country: "Singapore",
    website: "https://example.com/summit",
  },
];

/* -------------------------------------------------------------------------- */
/* BOOK DEFINITIONS                                                            */
/* -------------------------------------------------------------------------- */

// category = category index
// authors = author indexes
// publisher = publisher index

const BOOKS = [
  {
    title: "Algorithms in Practice",
    subtitle: "From Problem Statements to Efficient Solutions",
    category: 0,
    authors: [0, 8],
    publisher: 0,
    language: "English",
    year: 2024,
    pages: 184,
    tags: ["algorithms", "programming", "problem solving"],
  },
  {
    title: "Python for Practical Computing",
    subtitle: "A Project-Based Introduction",
    category: 0,
    authors: [0, 5],
    publisher: 1,
    language: "English",
    year: 2025,
    pages: 212,
    tags: ["python", "programming", "projects"],
  },
  {
    title: "Modern Data Structures",
    subtitle: "Choosing the Right Structure for the Job",
    category: 0,
    authors: [0, 13],
    publisher: 3,
    language: "English",
    year: 2023,
    pages: 168,
    tags: ["data structures", "algorithms", "programming"],
  },
  {
    title: "Foundations of Machine Learning",
    subtitle: "Concepts, Models, and Evaluation",
    category: 1,
    authors: [2, 6],
    publisher: 0,
    language: "English",
    year: 2024,
    pages: 236,
    tags: ["machine learning", "ai", "statistics"],
  },
  {
    title: "Applied Neural Networks",
    subtitle: "Building Small Intelligent Systems",
    category: 1,
    authors: [2, 9],
    publisher: 1,
    language: "English",
    year: 2025,
    pages: 198,
    tags: ["neural networks", "deep learning", "ai"],
  },
  {
    title: "Natural Language Systems",
    subtitle: "From Text Processing to Assistants",
    category: 1,
    authors: [9, 2],
    publisher: 2,
    language: "English",
    year: 2023,
    pages: 224,
    tags: ["nlp", "ai", "language"],
  },
  {
    title: "Computer Vision Essentials",
    subtitle: "Images, Features, and Recognition",
    category: 1,
    authors: [4, 9],
    publisher: 4,
    language: "English",
    year: 2022,
    pages: 206,
    tags: ["computer vision", "ai", "images"],
  },
  {
    title: "Responsible AI Engineering",
    subtitle: "Designing Systems People Can Trust",
    category: 1,
    authors: [9, 14],
    publisher: 5,
    language: "English",
    year: 2025,
    pages: 176,
    tags: ["ai ethics", "responsible ai", "ethics"],
    draft: true,
  },

  {
    title: "Database Design Patterns",
    subtitle: "Schemas, Constraints, and Queries",
    category: 2,
    authors: [7, 12],
    publisher: 0,
    language: "English",
    year: 2024,
    pages: 190,
    tags: ["databases", "sql", "design"],
  },
  {
    title: "SQL for Application Developers",
    subtitle: "Queries That Survive Real Projects",
    category: 2,
    authors: [12, 5],
    publisher: 1,
    language: "English",
    year: 2023,
    pages: 154,
    tags: ["sql", "databases", "backend"],
  },
  {
    title: "Data Modeling Fundamentals",
    subtitle: "Relational and Document Approaches",
    category: 2,
    authors: [7, 8],
    publisher: 3,
    language: "English",
    year: 2021,
    pages: 172,
    tags: ["data modeling", "mongodb", "sql"],
    archived: true,
  },
  {
    title: "Distributed Data Systems",
    subtitle: "Replication, Partitioning, and Consistency",
    category: 2,
    authors: [7, 11],
    publisher: 2,
    language: "English",
    year: 2025,
    pages: 248,
    tags: ["distributed systems", "databases", "scalability"],
    restricted: true,
  },

  {
    title: "Networking Fundamentals",
    subtitle: "How Modern Networks Move Data",
    category: 3,
    authors: [3, 13],
    publisher: 3,
    language: "English",
    year: 2022,
    pages: 188,
    tags: ["networks", "tcp ip", "internet"],
  },
  {
    title: "Routing and Switching Concepts",
    subtitle: "A Practical Network Guide",
    category: 3,
    authors: [3, 0],
    publisher: 4,
    language: "English",
    year: 2024,
    pages: 214,
    tags: ["routing", "switching", "networks"],
  },
  {
    title: "Internet Protocols Explained",
    subtitle: "HTTP, DNS, TLS, and Beyond",
    category: 3,
    authors: [3, 5],
    publisher: 1,
    language: "English",
    year: 2025,
    pages: 164,
    tags: ["http", "dns", "tls", "networks"],
    draft: true,
  },
  {
    title: "Distributed Communication",
    subtitle: "Reliable Services Across Networks",
    category: 3,
    authors: [7, 11],
    publisher: 2,
    language: "English",
    year: 2023,
    pages: 202,
    tags: ["distributed systems", "networks", "services"],
    restricted: true,
  },

  {
    title: "Operating Systems Concepts",
    subtitle: "Processes, Memory, and Files",
    category: 4,
    authors: [3, 8],
    publisher: 0,
    language: "English",
    year: 2021,
    pages: 226,
    tags: ["operating systems", "processes", "memory"],
  },
  {
    title: "Linux Systems Workshop",
    subtitle: "Command Lines, Services, and Permissions",
    category: 4,
    authors: [3, 11],
    publisher: 4,
    language: "English",
    year: 2024,
    pages: 178,
    tags: ["linux", "systems", "shell"],
  },
  {
    title: "Concurrency Without Fear",
    subtitle: "Threads, Locks, and Async Work",
    category: 4,
    authors: [1, 8],
    publisher: 1,
    language: "English",
    year: 2025,
    pages: 192,
    tags: ["concurrency", "threads", "async"],
  },

  {
    title: "Web APIs with Node.js",
    subtitle: "REST Services for Modern Applications",
    category: 5,
    authors: [5, 1],
    publisher: 1,
    language: "English",
    year: 2025,
    pages: 218,
    tags: ["nodejs", "rest", "api", "backend"],
  },
  {
    title: "React Application Architecture",
    subtitle: "Components, State, and Data Flow",
    category: 5,
    authors: [5, 8],
    publisher: 0,
    language: "English",
    year: 2024,
    pages: 204,
    tags: ["react", "frontend", "architecture"],
  },
  {
    title: "TypeScript for Full-Stack Teams",
    subtitle: "Safer JavaScript at Scale",
    category: 5,
    authors: [5, 1],
    publisher: 2,
    language: "English",
    year: 2025,
    pages: 186,
    tags: ["typescript", "javascript", "web"],
  },
  {
    title: "Building Accessible Web Interfaces",
    subtitle: "Inclusive Frontend Practices",
    category: 5,
    authors: [8, 5],
    publisher: 3,
    language: "English",
    year: 2023,
    pages: 142,
    tags: ["accessibility", "frontend", "web"],
    draft: true,
  },

  {
    title: "Application Security Basics",
    subtitle: "Threats, Defenses, and Secure Coding",
    category: 6,
    authors: [10, 4],
    publisher: 4,
    language: "English",
    year: 2024,
    pages: 196,
    tags: ["security", "secure coding", "web"],
  },
  {
    title: "Practical Cryptography",
    subtitle: "Keys, Hashes, and Secure Communication",
    category: 6,
    authors: [10, 3],
    publisher: 5,
    language: "English",
    year: 2022,
    pages: 208,
    tags: ["cryptography", "security", "privacy"],
    restricted: true,
  },
  {
    title: "API Security Handbook",
    subtitle: "Authentication, Authorization, and Validation",
    category: 6,
    authors: [10, 1],
    publisher: 1,
    language: "English",
    year: 2025,
    pages: 174,
    tags: ["api security", "jwt", "validation"],
  },
  {
    title: "Secure Database Applications",
    subtitle: "Protecting Data-Driven Services",
    category: 6,
    authors: [10, 12],
    publisher: 0,
    language: "English",
    year: 2023,
    pages: 160,
    tags: ["database security", "sql", "security"],
    archived: true,
  },

  {
    title: "Software Architecture Patterns",
    subtitle: "Boundaries, Services, and Maintainability",
    category: 7,
    authors: [8, 13],
    publisher: 2,
    language: "English",
    year: 2024,
    pages: 230,
    tags: ["architecture", "software engineering", "design"],
  },
  {
    title: "Testing Node.js Services",
    subtitle: "Unit, Integration, and API Testing",
    category: 7,
    authors: [1, 8],
    publisher: 1,
    language: "English",
    year: 2025,
    pages: 182,
    tags: ["testing", "nodejs", "api"],
  },
  {
    title: "Clean Code Workshop",
    subtitle: "Readable Code and Practical Refactoring",
    category: 7,
    authors: [8, 0],
    publisher: 0,
    language: "English",
    year: 2022,
    pages: 156,
    tags: ["clean code", "refactoring", "programming"],
  },
  {
    title: "Engineering Reliable Systems",
    subtitle: "Observability, Failure, and Recovery",
    category: 7,
    authors: [1, 11],
    publisher: 4,
    language: "English",
    year: 2025,
    pages: 240,
    tags: ["reliability", "observability", "systems"],
    restricted: true,
  },

  {
    title: "Statistics for Data Projects",
    subtitle: "Probability and Inference for Developers",
    category: 8,
    authors: [6, 12],
    publisher: 3,
    language: "English",
    year: 2023,
    pages: 210,
    tags: ["statistics", "data science", "probability"],
  },
  {
    title: "Data Visualization Principles",
    subtitle: "Turning Data into Useful Stories",
    category: 8,
    authors: [6, 14],
    publisher: 5,
    language: "English",
    year: 2024,
    pages: 166,
    tags: ["visualization", "analytics", "data science"],
  },
  {
    title: "Analytics with Python",
    subtitle: "From CSV Files to Useful Insights",
    category: 8,
    authors: [6, 12],
    publisher: 1,
    language: "English",
    year: 2025,
    pages: 194,
    tags: ["python", "analytics", "pandas"],
    draft: true,
  },
  {
    title: "Information Retrieval Basics",
    subtitle: "Search, Ranking, and Discovery",
    category: 8,
    authors: [2, 7],
    publisher: 2,
    language: "English",
    year: 2022,
    pages: 188,
    tags: ["search", "information retrieval", "data"],
  },

  {
    title: "Digital Privacy",
    subtitle: "Understanding Data in Connected Life",
    category: 9,
    authors: [14, 10],
    publisher: 5,
    language: "English",
    year: 2024,
    pages: 152,
    tags: ["privacy", "technology", "ethics"],
  },
  {
    title: "Technology and Society",
    subtitle: "How Digital Systems Change Everyday Life",
    category: 9,
    authors: [14, 6],
    publisher: 3,
    language: "English",
    year: 2021,
    pages: 178,
    tags: ["technology", "society", "ethics"],
  },
  {
    title: "Ethics for Software Developers",
    subtitle: "Making Better Engineering Decisions",
    category: 9,
    authors: [8, 14],
    publisher: 0,
    language: "English",
    year: 2025,
    pages: 144,
    tags: ["ethics", "software", "engineering"],
    restricted: true,
  },
  {
    title: "The Future of Digital Libraries",
    subtitle: "Search, Access, and Preservation",
    category: 9,
    authors: [0, 14],
    publisher: 2,
    language: "English",
    year: 2024,
    pages: 170,
    tags: ["digital libraries", "information", "technology"],
  },
];

/* -------------------------------------------------------------------------- */
/* SMALL FILE GENERATORS                                                       */
/* -------------------------------------------------------------------------- */

const crc32 = (buffer) => {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;

    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
};

/**
 * Downloads a real photograph to use as a book cover, instead of
 * generating a synthetic placeholder image.
 *
 * Uses Picsum Photos (https://picsum.photos), a keyless image service
 * that serves real photography (much of it sourced from Unsplash
 * photographers) with no API key or rate-limit signup required. The
 * `seed` value makes the choice deterministic per book — the same book
 * always gets the same photo on repeated seed runs — while different
 * books get different photos.
 *
 * Falls back through a couple of retries; if every attempt fails (e.g. no
 * network access in this environment), returns null and the caller simply
 * leaves the book without a cover rather than fabricating one.
 */
const COVER_WIDTH = 600;
const COVER_HEIGHT = 800;
const COVER_FETCH_ATTEMPTS = 3;
const COVER_FETCH_TIMEOUT_MS = 15000;

const looksLikeImageBuffer = (buffer) => {
  if (!buffer || buffer.length < 500) return false;
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  return isJpeg || isPng;
};

const fetchRealCoverImage = async (book, index) => {
  const seed = `${generateSlug(book.title) || "book"}-${index}`;
  const url = `https://picsum.photos/seed/${encodeURIComponent(seed)}/${COVER_WIDTH}/${COVER_HEIGHT}`;

  for (let attempt = 1; attempt <= COVER_FETCH_ATTEMPTS; attempt++) {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: COVER_FETCH_TIMEOUT_MS,
        maxRedirects: 5,
        headers: { "User-Agent": "e-library-seed-script/1.0" },
      });

      const buffer = Buffer.from(response.data);

      if (looksLikeImageBuffer(buffer)) {
        return buffer;
      }
    } catch (error) {
      log(
        `Cover fetch attempt ${attempt}/${COVER_FETCH_ATTEMPTS} failed for "${book.title}": ${error.message}`,
      );
    }
  }

  log(
    `Could not fetch a real cover photo for "${book.title}" — leaving cover unset.`,
  );
  return null;
};

/**
 * Generates a small valid PDF with several pages.
 */
const makePdf = (book, categoryName) => {
  const pageCount = 6;
  const objects = [];

  const pageObjectIds = [];
  const contentObjectIds = [];

  let nextId = 3;

  for (let i = 0; i < pageCount; i++) {
    pageObjectIds.push(nextId++);
    contentObjectIds.push(nextId++);
  }

  const fontObjectId = nextId++;

  const pagesKids = pageObjectIds.map((id) => `${id} 0 R`).join(" ");

  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;

  objects[2] = `<< /Type /Pages /Kids [${pagesKids}] /Count ${pageCount} >>`;

  for (let i = 0; i < pageCount; i++) {
    const pageId = pageObjectIds[i];
    const contentId = contentObjectIds[i];

    const textLines = [
      book.title,
      book.subtitle,
      "",
      `Synthetic E-Library test document`,
      `Chapter ${i + 1}`,
      "",
      `This original placeholder content is generated for development`,
      `and API testing of the E-Library application.`,
      "",
      `Category: ${categoryName}`,
      `Tags: ${book.tags.join(", ")}`,
      "",
      `This document can be used to test PDF upload, storage metadata,`,
      `book details, reading, downloading, and deletion workflows.`,
    ];

    const commands = ["BT", "/F1 14 Tf", "72 730 Td"];

    textLines.forEach((line, index) => {
      const safe = line.replace(/[()\\]/g, "\\$&");

      if (index > 0) {
        commands.push("0 -35 Td");
      }

      commands.push(`(${safe}) Tj`);
    });

    commands.push("ET");

    const stream = commands.join("\n");

    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R ` +
      `/MediaBox [0 0 612 792] ` +
      `/Resources << /Font << /F1 ${fontObjectId} 0 R >> >> ` +
      `/Contents ${contentId} 0 R >>`;

    objects[contentId] =
      `<< /Length ${Buffer.byteLength(stream)} >>\n` +
      `stream\n${stream}\nendstream`;
  }

  objects[fontObjectId] =
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [];

  for (let i = 1; i < objects.length; i++) {
    offsets[i] = Buffer.byteLength(pdf);

    pdf += `${i} 0 obj\n`;
    pdf += `${objects[i]}\n`;
    pdf += "endobj\n";
  }

  const xrefOffset = Buffer.byteLength(pdf);

  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";

  for (let i = 1; i < objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf +=
    `trailer\n` +
    `<< /Size ${objects.length} /Root 1 0 R >>\n` +
    `startxref\n` +
    `${xrefOffset}\n` +
    "%%EOF\n";

  return Buffer.from(pdf, "utf8");
};

/* -------------------------------------------------------------------------- */
/* MINIMAL EPUB ZIP GENERATOR                                                  */
/* -------------------------------------------------------------------------- */

const createZipEntry = (name, data, compressionMethod = 8) => {
  const nameBuffer = Buffer.from(name);
  const raw = Buffer.isBuffer(data) ? data : Buffer.from(data);

  const compressed = compressionMethod === 0 ? raw : zlib.deflateRawSync(raw);

  const entryCrc = crc32(raw);

  const localHeader = Buffer.alloc(30 + nameBuffer.length);

  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4);
  localHeader.writeUInt16LE(0, 6);
  localHeader.writeUInt16LE(compressionMethod, 8);
  localHeader.writeUInt16LE(0, 10);
  localHeader.writeUInt16LE(0, 12);
  localHeader.writeUInt32LE(entryCrc, 14);
  localHeader.writeUInt32LE(compressed.length, 18);
  localHeader.writeUInt32LE(raw.length, 22);
  localHeader.writeUInt16LE(nameBuffer.length, 26);
  localHeader.writeUInt16LE(0, 28);

  nameBuffer.copy(localHeader, 30);

  return {
    name,
    raw,
    compressed,
    crc: entryCrc,
    method: compressionMethod,
    localHeader,
  };
};

const makeEpub = (book, index, categoryName, authorName) => {
  const bookId = `book-${index + 1}`;

  const title = book.title.replace(/&/g, "&amp;");
  const subtitle = book.subtitle.replace(/&/g, "&amp;");

  const files = [
    ["mimetype", "application/epub+zip", 0],

    [
      "META-INF/container.xml",
      `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0"
 xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile
      full-path="OEBPS/content.opf"
      media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
    ],

    [
      "OEBPS/content.opf",
      `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf"
 version="3.0"
 unique-identifier="book-id">

  <metadata
    xmlns:dc="http://purl.org/dc/elements/1.1/">

    <dc:identifier id="book-id">${book.isbn}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:language>en</dc:language>
    <dc:creator>${authorName}</dc:creator>

  </metadata>

  <manifest>

    <item
      id="nav"
      href="nav.xhtml"
      media-type="application/xhtml+xml"
      properties="nav"/>

    <item
      id="${bookId}"
      href="${bookId}.xhtml"
      media-type="application/xhtml+xml"/>

  </manifest>

  <spine>
    <itemref idref="${bookId}"/>
  </spine>

</package>`,
    ],

    [
      "OEBPS/nav.xhtml",
      `<?xml version="1.0" encoding="UTF-8"?>
<html
 xmlns="http://www.w3.org/1999/xhtml"
 xmlns:epub="http://www.idpf.org/2007/ops">

<head>
  <title>${title}</title>
</head>

<body>

<nav epub:type="toc">

<ol>
<li>
<a href="${bookId}.xhtml">${title}</a>
</li>
</ol>

</nav>

</body>
</html>`,
    ],

    [
      `OEBPS/${bookId}.xhtml`,
      `<?xml version="1.0" encoding="UTF-8"?>

<html xmlns="http://www.w3.org/1999/xhtml">

<head>
<title>${title}</title>
</head>

<body>

<h1>${title}</h1>

<h2>${subtitle}</h2>

<p>
Synthetic E-Library test content.
</p>

<h2>Overview</h2>

<p>
This original EPUB is generated specifically for development and
API testing of the E-Library application.
</p>

<h2>Category</h2>

<p>
${categoryName}
</p>

<h2>Tags</h2>

<p>
${book.tags.join(", ")}
</p>

<h2>Testing Purpose</h2>

<p>
This file can be used to verify EPUB upload, Cloudinary storage,
metadata persistence, downloading, and digital-library workflows.
</p>

</body>

</html>`,
    ],
  ];

  const entries = files.map(([name, data, method]) =>
    createZipEntry(name, data, method ?? 8),
  );

  const localParts = [];
  let offset = 0;

  for (const entry of entries) {
    entry.offset = offset;

    localParts.push(entry.localHeader, entry.compressed);

    offset += entry.localHeader.length + entry.compressed.length;
  }

  const centralParts = [];

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name);

    const header = Buffer.alloc(46 + nameBuffer.length);

    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt16LE(entry.method, 10);
    header.writeUInt16LE(0, 12);
    header.writeUInt16LE(0, 14);
    header.writeUInt32LE(entry.crc, 16);
    header.writeUInt32LE(entry.compressed.length, 20);
    header.writeUInt32LE(entry.raw.length, 24);
    header.writeUInt16LE(nameBuffer.length, 28);
    header.writeUInt16LE(0, 30);
    header.writeUInt16LE(0, 32);
    header.writeUInt16LE(0, 34);
    header.writeUInt16LE(0, 36);
    header.writeUInt32LE(0, 38);
    header.writeUInt32LE(entry.offset, 42);

    nameBuffer.copy(header, 46);

    centralParts.push(header);
  }

  const localBuffer = Buffer.concat(localParts);
  const centralBuffer = Buffer.concat(centralParts);

  const eocd = Buffer.alloc(22);

  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuffer.length, 12);
  eocd.writeUInt32LE(localBuffer.length, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([localBuffer, centralBuffer, eocd]);
};

/* -------------------------------------------------------------------------- */
/* CLOUDINARY                                                                  */
/* -------------------------------------------------------------------------- */

const uploadAssets = async (book, index, categoryName, authorName) => {
  const timestamp = Date.now();

  const coverBuffer = await fetchRealCoverImage(book, index);

  let coverImage = null;

  if (coverBuffer) {
    const cover = await uploadBuffer(coverBuffer, {
      folder: FILE_LIMITS.cover.cloudinaryFolder,
      resourceType: FILE_LIMITS.cover.cloudinaryResourceType,
      publicId: `book-${book._id}-cover-${timestamp}`,
    });

    coverImage = {
      url: cover.secure_url,
      publicId: cover.public_id,
      format: cover.format,
      sizeBytes: cover.bytes,
      originalName: `${generateSlug(book.title)}-cover.jpg`,
      uploadedAt: new Date(),
    };
  }

  const pdf = await uploadBuffer(makePdf(book, categoryName), {
    folder: FILE_LIMITS.pdf.cloudinaryFolder,
    resourceType: FILE_LIMITS.pdf.cloudinaryResourceType,
    publicId: `book-${book._id}-pdf-${timestamp}`,
  });

  const epub = await uploadBuffer(
    makeEpub(book, index, categoryName, authorName),
    {
      folder: FILE_LIMITS.epub.cloudinaryFolder,
      resourceType: FILE_LIMITS.epub.cloudinaryResourceType,
      publicId: `book-${book._id}-epub-${timestamp}`,
    },
  );

  const uploadedAt = new Date();

  return {
    coverImage,

    digitalFiles: {
      pdf: {
        url: pdf.secure_url,
        publicId: pdf.public_id,
        format: pdf.format,
        sizeBytes: pdf.bytes,
        originalName: `${generateSlug(book.title)}.pdf`,
        uploadedAt,
      },

      epub: {
        url: epub.secure_url,
        publicId: epub.public_id,
        format: epub.format,
        sizeBytes: epub.bytes,
        originalName: `${generateSlug(book.title)}.epub`,
        uploadedAt,
      },
    },
  };
};

/* -------------------------------------------------------------------------- */
/* CLOUDINARY CLEANUP                                                          */
/* -------------------------------------------------------------------------- */

const removeBookAssets = async (books) => {
  for (const book of books) {
    if (book.coverImage?.publicId) {
      await deleteAsset(
        book.coverImage.publicId,
        FILE_LIMITS.cover.cloudinaryResourceType,
      );
    }

    if (book.digitalFiles?.pdf?.publicId) {
      await deleteAsset(
        book.digitalFiles.pdf.publicId,
        FILE_LIMITS.pdf.cloudinaryResourceType,
      );
    }

    if (book.digitalFiles?.epub?.publicId) {
      await deleteAsset(
        book.digitalFiles.epub.publicId,
        FILE_LIMITS.epub.cloudinaryResourceType,
      );
    }
  }
};

/* -------------------------------------------------------------------------- */
/* MAIN                                                                        */
/* -------------------------------------------------------------------------- */

async function run() {
  if (!MONGODB_URI) {
    console.error("[seed] MONGO_URI is not configured.");

    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  log("Connected to MongoDB.");

  /* ---------------------------------------------------------------------- */
  /* FRESH                                                                   */
  /* ---------------------------------------------------------------------- */

  if (isFreshRun) {
    log("--fresh detected. Removing existing development data...");

    const existingBooks = await Book.find({}).lean();

    await removeBookAssets(existingBooks);

    await Promise.all([
      Favorite.deleteMany({}),
      RecentlyViewed.deleteMany({}),
      Book.deleteMany({}),
      Category.deleteMany({}),
      Author.deleteMany({}),
      Publisher.deleteMany({}),

      User.deleteMany({
        email: {
          $in: USERS.map((user) => user.email),
        },
      }),
    ]);

    log("Development data removed.");
  }

  /* ---------------------------------------------------------------------- */
  /* USERS                                                                    */
  /* ---------------------------------------------------------------------- */

  const userDocs = {};

  for (const userData of USERS) {
    let user = await User.findOne({
      email: userData.email,
    });

    if (!user) {
      user = await User.create({
        ...userData,
        password: TEST_PASSWORD,
      });

      log(`Created user: ${userData.email}`);
    } else {
      log(`User already exists: ${userData.email}`);
    }

    userDocs[userData.email] = user;
  }

  const librarian = userDocs["librarian@elibrary.test"];

  const student1 = userDocs["student1@elibrary.test"];

  const student2 = userDocs["student2@elibrary.test"];

  /* ---------------------------------------------------------------------- */
  /* CATEGORIES                                                               */
  /* ---------------------------------------------------------------------- */

  const categoryDocs = [];

  for (const data of CATEGORIES) {
    let category = await Category.findOne({
      name: data.name,
    });

    if (!category) {
      category = await Category.create({
        ...data,
        slug: generateSlug(data.name),
        createdBy: librarian._id,
      });

      log(`Created category: ${data.name}`);
    }

    categoryDocs.push(category);
  }

  /* ---------------------------------------------------------------------- */
  /* AUTHORS                                                                  */
  /* ---------------------------------------------------------------------- */

  const authorDocs = [];

  for (const data of AUTHORS) {
    let author = await Author.findOne({
      name: data.name,
    });

    if (!author) {
      author = await Author.create({
        ...data,
        slug: generateSlug(data.name),
        createdBy: librarian._id,
      });

      log(`Created author: ${data.name}`);
    }

    authorDocs.push(author);
  }

  /* ---------------------------------------------------------------------- */
  /* PUBLISHERS                                                               */
  /* ---------------------------------------------------------------------- */

  const publisherDocs = [];

  for (const data of PUBLISHERS) {
    let publisher = await Publisher.findOne({
      name: data.name,
    });

    if (!publisher) {
      publisher = await Publisher.create({
        ...data,
        slug: generateSlug(data.name),
        createdBy: librarian._id,
      });

      log(`Created publisher: ${data.name}`);
    }

    publisherDocs.push(publisher);
  }

  /* ---------------------------------------------------------------------- */
  /* BOOKS                                                                    */
  /* ---------------------------------------------------------------------- */

  const bookDocs = [];

  for (const [index, data] of BOOKS.entries()) {
    const isbn = `979${String(1000000000 + index).slice(-10)}`;

    let book = await Book.findOne({
      isbn,
    });

    if (!book) {
      book = await Book.create({
        title: data.title,

        subtitle: data.subtitle,

        isbn,

        description:
          `Original synthetic development content for "${data.title}". ` +
          `This book is part of the E-Library mock catalog and is used ` +
          `for testing search, filtering, metadata, reading, downloading, ` +
          `and digital-file workflows.`,

        language: data.language,

        edition: `${(index % 3) + 1}st Edition`,

        publicationYear: data.year,

        numberOfPages: data.pages,

        category: categoryDocs[data.category]._id,

        authors: data.authors.map((authorIndex) => authorDocs[authorIndex]._id),

        publisher: publisherDocs[data.publisher]._id,

        tags: data.tags,

        uploadedBy: librarian._id,

        visibility: data.restricted
          ? BOOK_VISIBILITY.RESTRICTED
          : BOOK_VISIBILITY.PUBLIC,

        status: data.archived
          ? BOOK_STATUS.ARCHIVED
          : data.draft
            ? BOOK_STATUS.DRAFT
            : BOOK_STATUS.PUBLISHED,
      });

      log(`Created book ${index + 1}/${BOOKS.length}: ${data.title}`);
    } else {
      log(`Book already exists: ${data.title}`);
    }

    /* ------------------------------------------------------------------ */
    /* DIGITAL ASSETS                                                      */
    /* ------------------------------------------------------------------ */

    const hasCover = Boolean(book.coverImage?.publicId);

    const hasPdf = Boolean(book.digitalFiles?.pdf?.publicId);

    const hasEpub = Boolean(book.digitalFiles?.epub?.publicId);

    if (!hasCover || !hasPdf || !hasEpub) {
      log(`Generating missing assets: ${data.title}`);

      const assets = await uploadAssets(
        book,
        index,
        CATEGORIES[data.category].name,
        AUTHORS[data.authors[0]].name,
      );

      if (!hasCover && assets.coverImage) {
        book.coverImage = assets.coverImage;
      }

      if (!hasPdf) {
        book.digitalFiles.pdf = assets.digitalFiles.pdf;
      }

      if (!hasEpub) {
        book.digitalFiles.epub = assets.digitalFiles.epub;
      }

      await book.save();

      log(`Uploaded assets: ${data.title}`);
    }

    bookDocs.push(book);
  }

  /* ---------------------------------------------------------------------- */
  /* FAVORITES                                                               */
  /* ---------------------------------------------------------------------- */

  const student1Favorites = bookDocs.slice(0, 6);

  for (const book of student1Favorites) {
    await Favorite.findOneAndUpdate(
      {
        user: student1._id,
        book: book._id,
      },
      {
        user: student1._id,
        book: book._id,
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  const student2Favorites = bookDocs.slice(12, 17);

  for (const book of student2Favorites) {
    await Favorite.findOneAndUpdate(
      {
        user: student2._id,
        book: book._id,
      },
      {
        user: student2._id,
        book: book._id,
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  /* ---------------------------------------------------------------------- */
  /* RECENTLY VIEWED                                                         */
  /* ---------------------------------------------------------------------- */

  const student1Recent = bookDocs.slice(6, 14);

  for (const [index, book] of student1Recent.entries()) {
    await RecentlyViewed.findOneAndUpdate(
      {
        user: student1._id,
        book: book._id,
      },
      {
        user: student1._id,
        book: book._id,
        viewedAt: new Date(Date.now() - index * 60_000),
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  const student2Recent = bookDocs.slice(20, 25);

  for (const [index, book] of student2Recent.entries()) {
    await RecentlyViewed.findOneAndUpdate(
      {
        user: student2._id,
        book: book._id,
      },
      {
        user: student2._id,
        book: book._id,
        viewedAt: new Date(Date.now() - index * 90_000),
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  /* ---------------------------------------------------------------------- */
  /* SUMMARY                                                                  */
  /* ---------------------------------------------------------------------- */

  log("");
  log("======================================");
  log("E-LIBRARY MOCK DATA COMPLETE");
  log("======================================");

  log(`Users:       ${USERS.length}`);
  log(`Categories:  ${categoryDocs.length}`);
  log(`Authors:     ${authorDocs.length}`);
  log(`Publishers:  ${publisherDocs.length}`);
  log(`Books:       ${bookDocs.length}`);
  log(`Favorites:   ${student1Favorites.length + student2Favorites.length}`);
  log(`Recent views:${student1Recent.length + student2Recent.length}`);

  log("");
  log(`Password for all test users: ${TEST_PASSWORD}`);

  USERS.forEach((user) => {
    log(`${user.role.padEnd(10)} ${user.email}`);
  });

  log("");
  log("Cloudinary folders used:");
  log(`Cover: ${FILE_LIMITS.cover.cloudinaryFolder}`);
  log(`PDF:   ${FILE_LIMITS.pdf.cloudinaryFolder}`);
  log(`EPUB:  ${FILE_LIMITS.epub.cloudinaryFolder}`);

  await mongoose.disconnect();

  log("Disconnected from MongoDB.");
}

run().catch(async (error) => {
  console.error("[seed] Failed:", error);

  await mongoose.disconnect().catch(() => {});

  process.exit(1);
});
