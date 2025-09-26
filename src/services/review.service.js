const productModel = require("../model/product.model");
const Review = require("../model/review.model");
const mongoose = require("mongoose");
const User = require("../model/user.model");
const OrderModel = require("../model/Order.model");

class ReviewService {
    // Create a new review
    async createReview({ userId, productId, rating, title, comment, images, tags }) {
        // Optional: check duplicate review per user/product
        const userOrderExisting = await OrderModel.findOne({user:userId,"items.product":productId})
        if(!userOrderExisting) return {status:false,message:"This user has not placed any orders, so they cannot submit a review"}
        const userExisting = await User.findById(userId);
        if (userExisting.is_blocked) return { status: false, message: "This user has been blocked. Please contact the administrator for assistance." }
        if (userExisting.is_deleted) return {
            status: false,
            message: "This user account has been deleted. Please contact the administrator for assistance."
        }
        if (userExisting.is_register === false) return {
            status: true,
            message: "You are not registered."
        };
        const productExisting = await productModel.findById(productId)
        if (!productExisting && productExisting.isActive && !productExisting.is_deleted) return { status: false, message: "Product not found. Please check the product ID or make sure it exists" }
        const existing = await Review.findOne({ user: userId, product: productId });
        if (existing) return { status: false, message: "User has already reviewed this product." }

        const review = await Review.create({
            user: userId,
            product: productId,
            rating,
            title,
            comment,
            images,
            tags
        });

        return { status: true, data: review, message: "Review submitted successfully. Thank you for your feedback!" };
    }

    // Update existing review (only owner)
    async updateReview(reviewId, userId, data) {
        const review = await Review.findOneAndUpdate(
            { _id: reviewId, user: userId },
            { $set: data },
            { new: true }
        );
        if (!review) throw new Error("Review not found or unauthorized");
        return review;
    }

    // Delete review (only owner)
    async deleteReview(reviewId, userId) {
        const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });
        if (!review) throw new Error("Review not found or unauthorized");
        return review;
    }

    // Get reviews for a product with pagination
    async getReviews(productId, { page = 1, limit = 10, sort = "-createdAt" }) {
        const reviews = await Review.find({ product: productId, status: "approved" })
            .populate("user", "name avatar") // optional: get user info
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Review.countDocuments({ product: productId, status: "approved" });

        return { reviews, total, page, limit };
    }

    // Aggregate average rating & distribution
    async getRatingSummary(productId) {
        const result = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId), status: "approved" } },
            {
                $group: {
                    _id: "$product",
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    ratingDistribution: {
                        $push: "$rating"
                    }
                }
            }
        ]);

        if (!result[0])
            return { averageRating: 0, totalReviews: 0, ratingDistribution: [] };

        // optional: calculate count per star
        const dist = [1, 2, 3, 4, 5].map((star) => ({
            star,
            count: result[0].ratingDistribution.filter((r) => r === star).length
        }));

        return {
            averageRating: result[0].averageRating,
            totalReviews: result[0].totalReviews,
            ratingDistribution: dist
        };
    }

    // Add reply to a review (admin/seller)
    async addReply(reviewId, userId, comment) {
        const review = await Review.findByIdAndUpdate(
            reviewId,
            {
                $push: { reply: { user: userId, comment, createdAt: new Date() } }
            },
            { new: true }
        );
        if (!review) throw new Error("Review not found");
        return review;
    }
}

module.exports = new ReviewService();
