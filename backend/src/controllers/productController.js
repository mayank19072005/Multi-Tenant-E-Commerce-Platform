const Product = require('../models/Product');
const s3 = require('../config/s3');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

const createProduct = async (req, res) => {
  try {

    const {
      title,
      description,
      price,
      stock,
      category,
      images
    } = req.body;

    let tenantId = req.user.tenant_id;
    if (!tenantId) {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      if (user) {
        tenantId = user.tenant_id;
      }
    }

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required but was not found for this vendor user.'
      });
    }

    // Restrict product creation: Only approved (or active) vendors can create products
    const Tenant = require('../models/Tenant');
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found.'
      });
    }

    if (
      tenant.status !== 'approved'
    ) {

      return res.status(403).json({
        message:
          'Vendor Not Approved'
      });

    }

    const product = await Product.create({
      title,
      description,
      price,
      stock,
      category,
      images: images || [],

      tenant_id: tenantId,
      vendor_id: req.user.id
    });

    res.status(201).json({
      success: true,
      product
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: 'active'
    });

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getSingleProduct = async (req, res) => {

  try {

    const product =
      await Product.findById(req.params.id);

    if (!product) {

      return res.status(404).json({
        message: 'Product not found'
      });

    }

    res.json({
      success: true,
      product
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({
      tenant_id: req.user.tenant_id
    });

    res.json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      tenant_id: req.user.tenant_id
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product Not Found'
      });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({
      success: true,
      product
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      tenant_id: req.user.tenant_id
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product Not Found'
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product Deleted'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const searchProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword || '';

    const products = await Product.find({
      title: {
        $regex: keyword,
        $options: 'i'
      },
      status: 'active'
    });

    res.json({
      success: true,
      products
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const uploadProductImage = async (req, res) => {
  try {

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: 'No File Uploaded'
      });
    }

    const fileName =
      `${Date.now()}-${file.originalname}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    const imageUrl =
      `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    res.json({
      success: true,
      imageUrl
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const uploadProductImages = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: 'No Files Uploaded'
      });
    }

    const uploadPromises = files.map(async (file) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype
        })
      );
      return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    });

    const imageUrls = await Promise.all(uploadPromises);

    res.json({
      success: true,
      imageUrls
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  getVendorProducts,
  updateProduct,
  deleteProduct,
  searchProducts,
  uploadProductImage,
  uploadProductImages
};