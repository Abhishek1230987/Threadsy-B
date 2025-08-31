import {v2 as cloudinary} from 'cloudinary';

const connectCloudinary = async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};
// This code configures Cloudinary with the credentials stored in environment variables.
// It uses the `v2` version of the Cloudinary library and exports the configured instance.

export default connectCloudinary;
