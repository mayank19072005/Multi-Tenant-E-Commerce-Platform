const Category = require('../models/Category');

const createCategory = async (req, res) => {
  try {

    const { name } = req.body;

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-');

    const category = await Category.create({
      name,
      slug
    });

    res.status(201).json({
      success: true,
      category
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const getCategories = async (req, res) => {
  try {

    const categories = await Category.find({
      status: 'active'
    });

    res.json({
      success: true,
      categories
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        message: 'Category Not Found'
      });
    }

    Object.assign(category, req.body);
    await category.save();

    res.json({
      success: true,
      category
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        message: 'Category Not Found'
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category Deleted'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
};