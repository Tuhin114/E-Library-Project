// FILE PATH: backend/src/scripts/seedMockData.js
// STATUS: NEW FILE
//
// Inserts mock Users, Categories, Authors, Publishers, Books, Favorites,
// and RecentlyViewed entries for local/dev testing. See
// MOCK_DATA_PLAN.md for the full rationale behind what's seeded and why.
//
// Usage:
//   node src/scripts/seedMockData.js            # idempotent insert (skips existing records by name/email/ISBN)
//   node src/scripts/seedMockData.js --fresh     # wipe managed collections + seed User accounts, then re-seed clean
//
// ⚠️ Never run --fresh against a production database.
//
// ⚠️ ASSUMPTION: your MongoDB connection string env var is MONGODB_URI,
// matching the common Phase 1 naming convention. If your actual .env uses
// a different name (e.g. MONGO_URI, DATABASE_URL), update the one line
// below marked with ⚠️ — nothing else in this script needs to change.

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Author from "../models/Author.js";
import Publisher from "../models/Publisher.js";
import Book from "../models/Book.js";
import Favorite from "../models/Favorite.js";
import RecentlyViewed from "../models/RecentlyViewed.js";
import { generateSlug } from "../utils/slugify.js";
import { ROLES } from "../constants/roles.js";
import { BOOK_STATUS } from "../constants/bookStatus.js";
import { BOOK_VISIBILITY } from "../constants/bookVisibility.js";

dotenv.config();

const isFreshRun = process.argv.includes("--fresh");

// ⚠️ Update this line if your env var is named differently.
const MONGODB_URI = process.env.MONGO_URI;

const TEST_PASSWORD = "Password123!";

const USERS = [
  {
    name: "Lena Whitmore",
    email: "librarian@elibrary.test",
    role: ROLES.LIBRARIAN,
  },
  { name: "Sam Okafor", email: "faculty@elibrary.test", role: ROLES.FACULTY },
  { name: "Priya Nair", email: "student1@elibrary.test", role: ROLES.STUDENT },
  {
    name: "Diego Ramirez",
    email: "student2@elibrary.test",
    role: ROLES.STUDENT,
  },
];

const CATEGORIES = [
  { name: "Fiction", description: "Novels and short story collections." },
  {
    name: "Science",
    description: "Popular science and research-adjacent reading.",
  },
  { name: "Technology", description: "Software, engineering, and computing." },
  { name: "History", description: "World and regional history." },
  { name: "Biography", description: "Life stories of notable people." },
  {
    name: "Philosophy",
    description: "Philosophical works, classic and modern.",
  },
];

const AUTHORS = [
  {
    name: "J.R.R. Tolkien",
    nationality: "British",
    bio: "English writer best known for The Hobbit and The Lord of the Rings.",
  },
  {
    name: "Isabel Allende",
    nationality: "Chilean",
    bio: "Novelist known for magical realism.",
  },
  {
    name: "Yuval Noah Harari",
    nationality: "Israeli",
    bio: "Historian and author of Sapiens.",
  },
  {
    name: "Chimamanda Ngozi Adichie",
    nationality: "Nigerian",
    bio: "Novelist and essayist.",
  },
  {
    name: "Carl Sagan",
    nationality: "American",
    bio: "Astronomer and science communicator.",
  },
  {
    name: "Haruki Murakami",
    nationality: "Japanese",
    bio: "Novelist known for surreal, genre-blending fiction.",
  },
  {
    name: "Martin Kleppmann",
    nationality: "German",
    bio: "Author of Designing Data-Intensive Applications.",
  },
  {
    name: "Michelle Obama",
    nationality: "American",
    bio: "Author and former First Lady of the United States.",
  },
];

const PUBLISHERS = [
  {
    name: "Penguin Random House",
    country: "United States",
    website: "https://www.penguinrandomhouse.com",
  },
  {
    name: "HarperCollins",
    country: "United States",
    website: "https://www.harpercollins.com",
  },
  {
    name: "O'Reilly Media",
    country: "United States",
    website: "https://www.oreilly.com",
  },
  {
    name: "Bloomsbury Publishing",
    country: "United Kingdom",
    website: "https://www.bloomsbury.com",
  },
  {
    name: "Simon & Schuster",
    country: "United States",
    website: "https://www.simonandschuster.com",
  },
];

// `category`/`authors`/`publisher` below are indexes into the arrays
// above — resolved to real ids after Categories/Authors/Publishers exist.
const BOOKS = [
  {
    title: "The Hobbit",
    isbn: "9780547928227",
    category: 0,
    authors: [0],
    publisher: 1,
    language: "English",
    publicationYear: 1937,
    numberOfPages: 310,
    tags: ["fantasy", "classic", "adventure"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "The House of the Spirits",
    isbn: "9780553383805",
    category: 0,
    authors: [1],
    publisher: 0,
    language: "English",
    publicationYear: 1982,
    numberOfPages: 448,
    tags: ["fiction", "magical realism"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    isbn: "9780062316097",
    category: 3,
    authors: [2],
    publisher: 1,
    language: "English",
    publicationYear: 2011,
    numberOfPages: 443,
    tags: ["history", "anthropology", "bestseller"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "Half of a Yellow Sun",
    isbn: "9781400095209",
    category: 0,
    authors: [3],
    publisher: 4,
    language: "English",
    publicationYear: 2006,
    numberOfPages: 448,
    tags: ["fiction", "historical"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "Cosmos",
    isbn: "9780345539434",
    category: 1,
    authors: [4],
    publisher: 0,
    language: "English",
    publicationYear: 1980,
    numberOfPages: 396,
    tags: ["science", "astronomy", "classic"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "Norwegian Wood",
    isbn: "9780375704024",
    category: 0,
    authors: [5],
    publisher: 1,
    language: "English",
    publicationYear: 1987,
    numberOfPages: 296,
    tags: ["fiction", "literary"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "Designing Data-Intensive Applications",
    isbn: "9781449373320",
    category: 2,
    authors: [6],
    publisher: 2,
    language: "English",
    publicationYear: 2017,
    numberOfPages: 616,
    tags: ["technology", "databases", "engineering"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "Becoming",
    isbn: "9781524763138",
    category: 4,
    authors: [7],
    publisher: 4,
    language: "English",
    publicationYear: 2018,
    numberOfPages: 448,
    tags: ["biography", "memoir"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "The Fellowship of the Ring",
    isbn: "9780547928210",
    category: 0,
    authors: [0],
    publisher: 1,
    language: "English",
    publicationYear: 1954,
    numberOfPages: 423,
    tags: ["fantasy", "classic"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "Homo Deus: A Brief History of Tomorrow",
    isbn: "9780062464316",
    category: 3,
    authors: [2],
    publisher: 1,
    language: "English",
    publicationYear: 2016,
    numberOfPages: 450,
    tags: ["history", "science", "future"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "Kafka on the Shore",
    isbn: "9781400079278",
    category: 0,
    authors: [5],
    publisher: 1,
    language: "English",
    publicationYear: 2002,
    numberOfPages: 505,
    tags: ["fiction", "surreal"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "Americanah",
    isbn: "9780307455925",
    category: 0,
    authors: [3],
    publisher: 4,
    language: "English",
    publicationYear: 2013,
    numberOfPages: 588,
    tags: ["fiction", "contemporary"],
    status: BOOK_STATUS.DRAFT,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "Pale Blue Dot",
    isbn: "9780345376596",
    category: 1,
    authors: [4],
    publisher: 0,
    language: "English",
    publicationYear: 1994,
    numberOfPages: 384,
    tags: ["science", "space"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "The Two Towers",
    isbn: "9780547928203",
    category: 0,
    authors: [0],
    publisher: 1,
    language: "English",
    publicationYear: 1954,
    numberOfPages: 352,
    tags: ["fantasy", "classic"],
    status: BOOK_STATUS.ARCHIVED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "Streaming Systems",
    isbn: "9781491983874",
    category: 2,
    authors: [6],
    publisher: 2,
    language: "English",
    publicationYear: 2018,
    numberOfPages: 300,
    tags: ["technology", "data engineering"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "Eva Luna",
    isbn: "9780553381044",
    category: 0,
    authors: [1],
    publisher: 0,
    language: "Spanish",
    publicationYear: 1987,
    numberOfPages: 320,
    tags: ["fiction", "magical realism"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "21 Lessons for the 21st Century",
    isbn: "9780525512172",
    category: 5,
    authors: [2],
    publisher: 1,
    language: "English",
    publicationYear: 2018,
    numberOfPages: 372,
    tags: ["philosophy", "politics"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.RESTRICTED,
  },
  {
    title: "The Return of the King",
    isbn: "9780547928197",
    category: 0,
    authors: [0],
    publisher: 1,
    language: "English",
    publicationYear: 1955,
    numberOfPages: 416,
    tags: ["fantasy", "classic"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "Purple Hibiscus",
    isbn: "9781616202415",
    category: 0,
    authors: [3],
    publisher: 4,
    language: "English",
    publicationYear: 2003,
    numberOfPages: 307,
    tags: ["fiction"],
    status: BOOK_STATUS.DRAFT,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
  {
    title: "The Demon-Haunted World",
    isbn: "9780345409461",
    category: 1,
    authors: [4],
    publisher: 0,
    language: "English",
    publicationYear: 1995,
    numberOfPages: 480,
    tags: ["science", "skepticism"],
    status: BOOK_STATUS.PUBLISHED,
    visibility: BOOK_VISIBILITY.PUBLIC,
  },
];

const log = (message) => console.log(`[seed] ${message}`);

async function run() {
  if (!MONGODB_URI) {
    console.error("[seed] MONGODB_URI is not set. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  log("Connected to MongoDB.");

  if (isFreshRun) {
    log("--fresh flag detected: wiping existing mock collections...");
    await Promise.all([
      Favorite.deleteMany({}),
      RecentlyViewed.deleteMany({}),
      Book.deleteMany({}),
      Category.deleteMany({}),
      Author.deleteMany({}),
      Publisher.deleteMany({}),
      User.deleteMany({ email: { $in: USERS.map((user) => user.email) } }),
    ]);
    log("Wipe complete.");
  }

  // --- Users -----------------------------------------------------------
  // Uses .create() (not insertMany) so the User model's pre-save bcrypt
  // hash hook actually runs — insertMany bypasses Mongoose middleware.
  const userDocs = {};
  for (const userData of USERS) {
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = await User.create({ ...userData, password: TEST_PASSWORD });
      log(`Created user: ${userData.email} (${userData.role})`);
    } else {
      log(`User already exists, skipping: ${userData.email}`);
    }
    userDocs[userData.email] = user;
  }
  const librarian = userDocs["librarian@elibrary.test"];
  const student1 = userDocs["student1@elibrary.test"];

  // --- Categories --------------------------------------------------------
  const categoryDocs = [];
  for (const categoryData of CATEGORIES) {
    let category = await Category.findOne({ name: categoryData.name });
    if (!category) {
      category = await Category.create({
        ...categoryData,
        slug: generateSlug(categoryData.name),
        createdBy: librarian._id,
      });
      log(`Created category: ${categoryData.name}`);
    }
    categoryDocs.push(category);
  }

  // --- Authors -----------------------------------------------------------
  const authorDocs = [];
  for (const authorData of AUTHORS) {
    let author = await Author.findOne({ name: authorData.name });
    if (!author) {
      author = await Author.create({
        ...authorData,
        slug: generateSlug(authorData.name),
        createdBy: librarian._id,
      });
      log(`Created author: ${authorData.name}`);
    }
    authorDocs.push(author);
  }

  // --- Publishers --------------------------------------------------------
  const publisherDocs = [];
  for (const publisherData of PUBLISHERS) {
    let publisher = await Publisher.findOne({ name: publisherData.name });
    if (!publisher) {
      publisher = await Publisher.create({
        ...publisherData,
        slug: generateSlug(publisherData.name),
        createdBy: librarian._id,
      });
      log(`Created publisher: ${publisherData.name}`);
    }
    publisherDocs.push(publisher);
  }

  // --- Books ---------------------------------------------------------
  const bookDocs = [];
  for (const bookData of BOOKS) {
    let book = await Book.findOne({ isbn: bookData.isbn });
    if (!book) {
      book = await Book.create({
        title: bookData.title,
        isbn: bookData.isbn,
        language: bookData.language,
        publicationYear: bookData.publicationYear,
        numberOfPages: bookData.numberOfPages,
        tags: bookData.tags,
        status: bookData.status,
        visibility: bookData.visibility,
        category: categoryDocs[bookData.category]._id,
        authors: bookData.authors.map(
          (authorIndex) => authorDocs[authorIndex]._id,
        ),
        publisher: publisherDocs[bookData.publisher]._id,
        uploadedBy: librarian._id,
      });
      log(`Created book: ${bookData.title}`);
    }
    bookDocs.push(book);
  }

  // --- Favorites & Recently Viewed (demo data for student1) --------------
  const favoritePicks = bookDocs.slice(0, 4);
  for (const book of favoritePicks) {
    await Favorite.findOneAndUpdate(
      { user: student1._id, book: book._id },
      { user: student1._id, book: book._id },
      { upsert: true },
    );
  }
  log(`Seeded ${favoritePicks.length} favorites for student1@elibrary.test`);

  const recentPicks = bookDocs.slice(4, 10);
  for (const [index, book] of recentPicks.entries()) {
    await RecentlyViewed.findOneAndUpdate(
      { user: student1._id, book: book._id },
      {
        user: student1._id,
        book: book._id,
        viewedAt: new Date(Date.now() - index * 60_000),
      },
      { upsert: true },
    );
  }
  log(
    `Seeded ${recentPicks.length} recently-viewed entries for student1@elibrary.test`,
  );

  log("Done.");
  log("---");
  log(`Test accounts (password for all: "${TEST_PASSWORD}"):`);
  USERS.forEach((user) => log(`  ${user.role.padEnd(10)} ${user.email}`));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((error) => {
  console.error("[seed] Failed:", error);
  process.exit(1);
});
