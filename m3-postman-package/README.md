# E-Library M3 Automated Postman Package

This package is designed to run the M3 multipart/file tests without manually
selecting files in Postman.

## 1. Generate the test files

```bash
npm install
npm run generate:m3-files
```

## 2. Run the entire M3 suite automatically

```bash
npm run test:m3
```

This uses Newman. It runs the collection from this package directory, so
the file references such as `m3-test-files/cover-valid.jpg` resolve to the
generated local files.

Windows PowerShell shortcut:

```powershell
.un-m3.ps1
```

## 3. Postman GUI

The collection can still be imported into Postman for inspection and
manual debugging. Postman's GUI may require selecting local files manually
after import. That is a Postman Desktop behavior and is separate from the
Newman automated run.

## Important

Start the E-Library backend before running the suite.

The M3 setup automatically calls `GET /books`, selects the first returned
book `_id`, and stores it in `m3ReferenceBookId`.

The suite expects the local environment values for the seeded accounts.
Change them if your database uses different test credentials.

Some Cloudinary checks remain manual because the API response alone cannot
prove that an old Cloudinary asset was physically deleted.
