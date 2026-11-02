import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configuration 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'produs_banners',
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1920, height: 500, crop: 'limit' }]
  },
});

const wishlistStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'produs_wishlist',
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'produs_avatars',
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }]
  },
});

const generalStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'produs_uploads',
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    transformation: [{ width: 1600, height: 1600, crop: 'limit' }]
  },
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.'), false);
  }
};

export const uploadBanner = multer({ storage: storage, limits: { fileSize: MAX_FILE_SIZE }, fileFilter: imageFileFilter });
export const uploadWishlist = multer({ storage: wishlistStorage, limits: { fileSize: MAX_FILE_SIZE }, fileFilter: imageFileFilter });
export const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: MAX_FILE_SIZE }, fileFilter: imageFileFilter });
export const uploadGeneral = multer({ storage: generalStorage, limits: { fileSize: MAX_FILE_SIZE }, fileFilter: imageFileFilter });

