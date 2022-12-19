import express, { Response, Request, NextFunction, Application } from 'express';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { randomNumberBetween } from './utils/utils';

const HOSTNAME = 'http://localhost:3001/';

// Initialize Prisma Client
const prisma = new PrismaClient();

const PORT = 3001;

const app: Application = express();

// CORS So We Can Access Our App From A Different Port (eg: From React Port: 3000)
app.use(cors());

// Set Public Folder As Static
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configure Multer Storage
const storage = multer.diskStorage({
	destination: 'public/uploads',
	filename: (req, file, cb) => {
		cb(null, uuid() + file.originalname);
	},
});

// Middleware Settings For Single File/Image
const upload = multer({
	storage,
}).single('image');

// Upload A Image For A Breed
app.post('/upload', upload, async (req: Request, res: Response) => {
	const filename = req.file?.filename;
	const breedName = (req.body.breedName as string)
		.split(' ')
		.join('-')
		.toLowerCase();
	console.log(breedName);

	const breed = await prisma.breed.findFirst({
		where: {
			name: breedName,
		},
	});

	if (breed) {
		const data = await prisma.breedImage.create({
			data: {
				href: HOSTNAME + 'uploads/' + filename,
				breedId: breed.id,
			},
		});
		res.json(data);
	} else {
		const breed = await prisma.breed.create({
			data: {
				name: breedName,
			},
		});
		const breedImage = await prisma.breedImage.create({
			data: {
				breedId: breed.id,
				href: HOSTNAME + 'uploads/' + filename,
			},
		});
		res.json(breedImage);
	}
});

// Get Random Image
app.get('/random', async (req: Request, res: Response) => {
	const sum = await prisma.breedImage.count();
	const image = await prisma.breedImage.findFirst({
		skip: randomNumberBetween(sum),
		take: 1,
	});
	res.json(image);
});

// Get Random Image By Breed
app.get('/breed/:breedName/random', async (req: Request, res: Response) => {
	const breedName = (req.params.breedName as string).toLowerCase();
	const sum = await prisma.breed.findMany({
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
	const randomImage = await prisma.breedImage.findFirst({
		skip: count,
		take: 1,
		where: {
			Breed: {
				name: breedName,
			},
		},
	});
	res.json(randomImage);
});

// Get All Images By Breed
app.get('/breed/:breedName/all', async (req: Request, res: Response) => {
	const breedName = (req.params.breedName as string).toLowerCase();
	const images = await prisma.breedImage.findMany({
		where: {
			Breed: {
				name: breedName,
			},
		},
	});
	res.json(images);
});

// List All Breeds
app.get('/', async (req: Request, res: Response) => {
	const breeds = await prisma.breed.findMany();
	res.json(breeds);
});

app.listen(PORT, () => {
	console.log('Listening on Port: ' + PORT);
});
/uploads/;
