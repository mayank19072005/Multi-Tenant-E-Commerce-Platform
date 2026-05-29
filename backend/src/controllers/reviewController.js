const Review =
  require('../models/Review');

const addReview = async (
  req,
  res
) => {

  try {

    const {
      product_id,
      rating,
      comment
    } = req.body;

    const review =
      await Review.create({

        product_id,

        customer_id:
          req.user.id,

        rating,

        comment

      });

    res.status(201).json({

      success: true,

      review

    });

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};

const getReviews = async (
  req,
  res
) => {

  try {

    const reviews =
      await Review.find({

        product_id:
          req.params.productId

      }).populate(
        'customer_id',
        'name'
      );

    res.json({

      success: true,

      reviews

    });

  } catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};

module.exports = {

  addReview,

  getReviews

};
