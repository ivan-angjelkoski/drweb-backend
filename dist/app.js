"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const utils_1 = require("./utils/utils");
const HOSTNAME = 'http://localhost:3001/';
// Initialize Prisma Client
const prisma = new client_1.PrismaClient();
const PORT = 3001;
const app = (0, express_1.default)();
// CORS So We Can Access Our App From A Different Port (eg: From React Port: 3000)
app.use((0, cors_1.default)());
// Set Public Folder As Static
app.use(express_1.default.static('public'));
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
// Configure Multer Storage
const storage = multer_1.default.diskStorage({
    destination: 'public/uploads',
    filename: (req, file, cb) => {
        cb(null, (0, uuid_1.v4)() + file.originalname);
    },
});
// Middleware Settings For Single File/Image
const upload = (0, multer_1.default)({
    storage,
}).single('image');
// Upload A Image For A Breed
app.post('/upload', upload, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const filename = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename;
    const breedName = req.body.breedName
        .split(' ')
        .join('-')
        .toLowerCase();
    console.log(breedName);
    const breed = yield prisma.breed.findFirst({
        where: {
            name: breedName,
        },
    });
    if (breed) {
        const data = yield prisma.breedImage.create({
            data: {
                href: HOSTNAME + 'uploads/' + filename,
                breedId: breed.id,
            },
        });
        res.json(data);
    }
    else {
        const breed = yield prisma.breed.create({
            data: {
                name: breedName,
            },
        });
        const breedImage = yield prisma.breedImage.create({
            data: {
                breedId: breed.id,
                href: HOSTNAME + 'uploads/' + filename,
            },
        });
        res.json(breedImage);
    }
}));
// Get Random Image
app.get('/random', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sum = yield prisma.breedImage.count();
    const image = yield prisma.breedImage.findFirst({
        skip: (0, utils_1.randomNumberBetween)(sum),
        take: 1,
    });
    res.json(image);
}));
// Get Random Image By Breed
app.get('/breed/:breedName/random', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const breedName = req.params.breedName.toLowerCase();
    const sum = yield prisma.breed.findMany({
        where: {
            name: breedName,
        },
        include: {
            _count: {
                select: {
                    images: true,
                },
            },
        },
    });
    // Total Images For The Breed and Picking a random number in between
    const count = Math.floor(Math.random() * sum[0]._count.images);
    // Using Pagination Skip And Take To Get A Random Record
    const randomImage = yield prisma.breedImage.findFirst({
        skip: count,
        take: 1,
        where: {
            Breed: {
                name: breedName,
            },
        },
    });
    res.json(randomImage);
}));
// Get All Images By Breed
app.get('/breed/:breedName/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const breedName = req.params.breedName.toLowerCase();
    const images = yield prisma.breedImage.findMany({
        where: {
            Breed: {
                name: breedName,
            },
        },
    });
    res.json(images);
}));
// List All Breeds
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const breeds = yield prisma.breed.findMany();
    res.json(breeds);
}));
app.listen(PORT, () => {
    console.log('Listening on Port: ' + PORT);
});
/uploads/;
