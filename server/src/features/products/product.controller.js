import * as productModel from './product.model.js';
import * as reviewModel from './review.model.js';
import ApiError from '../../shared/errors/ApiError.js';
import { fetchIMSStocks } from '../../integrations/ims/imsClient.js';

/**
 * Fetch list of products based on query criteria (search, category, range, sorting).
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy } = req.query;

    const products = await productModel.findAll({
      search,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : 0,
      maxPrice: maxPrice ? parseFloat(maxPrice) : 1000000,
      sortBy,
    });

    // Merge real-time stocks from IMS
    const imsStocks = await fetchIMSStocks();
    if (imsStocks) {
      products.forEach(p => {
        if (imsStocks[p.name] !== undefined) {
          p.stock = imsStocks[p.name];
        }
      });
    }

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch a single product's detailed description alongside its full reviews.
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return next(new ApiError(404, 'No product found with that ID.'));
    }

    // Join reviews in product retrieval
    const reviews = await reviewModel.findByProduct(req.params.id);

    // Merge real-time stock from IMS
    const imsStocks = await fetchIMSStocks();
    if (imsStocks && imsStocks[product.name] !== undefined) {
      product.stock = imsStocks[product.name];
    }

    res.status(200).json({
      status: 'success',
      data: {
        product,
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create new product (admin).
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, image_url, category, stock } = req.body;

    if (!name || !description || price === undefined || !image_url || !category || stock === undefined) {
      return next(new ApiError(400, 'All fields are required.'));
    }

    const newProduct = await productModel.create({
      name,
      description,
      price: parseFloat(price),
      image_url,
      category,
      stock: parseInt(stock, 10),
    });

    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update product (admin).
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, image_url, category, stock } = req.body;

    const product = await productModel.findById(req.params.id);
    if (!product) {
      return next(new ApiError(404, 'No product found with that ID.'));
    }

    const updatedProduct = await productModel.update(req.params.id, {
      name: name || product.name,
      description: description || product.description,
      price: price !== undefined ? parseFloat(price) : product.price,
      image_url: image_url || product.image_url,
      category: category || product.category,
      stock: stock !== undefined ? parseInt(stock, 10) : product.stock,
    });

    res.status(200).json({
      status: 'success',
      data: {
        product: updatedProduct,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete product (admin).
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return next(new ApiError(404, 'No product found with that ID.'));
    }

    await productModel.remove(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Submit user review for a product.
 */
export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    if (!rating || !comment) {
      return next(new ApiError(400, 'Please provide rating score and review comments.'));
    }

    const parsedRating = parseInt(rating, 10);
    if (parsedRating < 1 || parsedRating > 5) {
      return next(new ApiError(400, 'Rating must be between 1 and 5 stars.'));
    }

    // Verify product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return next(new ApiError(404, 'No product found with that ID.'));
    }

    // Verify if user has already left a review
    const alreadyReviewed = await reviewModel.hasUserReviewed(userId, productId);
    if (alreadyReviewed) {
      return next(new ApiError(400, 'You have already reviewed this product.'));
    }

    // Create the review
    const review = await reviewModel.create({
      userId,
      productId,
      rating: parsedRating,
      comment,
    });

    res.status(201).json({
      status: 'success',
      data: {
        review,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieve unique list of categories.
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await productModel.getCategories();
    res.status(200).json({
      status: 'success',
      data: {
        categories,
      },
    });
  } catch (err) {
    next(err);
  }
};
