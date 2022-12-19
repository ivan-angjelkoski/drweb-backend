-- CreateTable
CREATE TABLE "Breed" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BreedImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "href" TEXT NOT NULL,
    "breedId" TEXT,
    CONSTRAINT "BreedImage_breedId_fkey" FOREIGN KEY ("breedId") REFERENCES "Breed" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
