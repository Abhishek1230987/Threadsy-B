// backend/controllers/productController.js
import { v2 as cloudinary } from "cloudinary"; 
import productModel from '../models/productModel.js';



const addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      category,
      subCategory,
      sizes,
      bestSeller
    } = req.body;

    // Optional chaining to avoid TypeError
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

    // for cludinary upload so that we can get the image URL
    let imagesURL = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
        return result.secure_url;
      })
    );

    //
    const productData = {
      name,
      price:Number(price),
      description,
      category,
      subCategory,
      sizes: JSON.parse(sizes),
      bestSeller: bestSeller === 'true' ? true : false,
      images: imagesURL,
      date: Date.now()
    };

    console.log('Product Data:', productData);

    // Create a new product instance
    const product = new productModel(productData);
    await product.save();

    res.json({success: true, message: 'Product added successfully'});
  } catch (error) {
    console.error('Error in addProduct:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Placeholder functions for other routes
const listProducts = async (req, res) => {
  try {
    // TODO: Get all products
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    // TODO: Get product by ID
    const { productid } = req.body;
    const product = await productModel.findById(productid);

    res.json({ success: true, product });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    // TODO: Update product
    const { id, name, price, description, category, subCategory, sizes, bestSeller } = req.body;
    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    product.name = name;
    product.price = Number(price);
    product.description = description;
    product.category = category;
    product.subCategory = subCategory;
    product.sizes = JSON.parse(sizes);
    product.bestSeller = bestSeller === 'true' ? true : false;

    await product.save();
    // If images are provided, handle image updates
    const images = [req.files.image1, req.files.image2, req.files.image3, req.files.image4].filter((item) => item && item.length > 0);
    if (images.length > 0) {  
      const imagesURL = await Promise.all(
        images.map(async (item) => {
          const result = await cloudinary.uploader.upload(item[0].path, { resource_type: 'image' });
          return result.secure_url;
        })
      );
      product.images = imagesURL;
    }
    await product.save();
    console.log('Product updated:', product);
    res.json({ success: true, message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    // TODO: Delete product
    const { id } = req.body;
    await productModel.findByIdAndDelete(req.body.id);

    res.json({ success: true, message: 'Product deleted' });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  addProduct,
  listProducts,
  getSingleProduct,
  updateProduct,
  removeProduct
};
