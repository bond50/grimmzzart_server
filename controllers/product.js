const slugify = require('slugify');
const Product = require('../models/product');
const User = require('../models/user');
const {errorHandler} = require('../helpers/dbErrorHandler');
const NodeCache = require('node-cache');
const cache = new NodeCache();
const Brand = require('../models/brand');

exports.list = async (req, res) => {
    try {
        const { sort, order, page, limit, searchTerm } = req.query;

        console.log(searchTerm)

        const currentPage = page || 1;
        const perPage = limit ? parseInt(limit) : 6; // Use limit from query if available, else default to 6
        let query = {};

        if (sort === 'isFeatured') {
            query.isFeatured = true;
        }

        if (searchTerm) {
            query.displayTitle = { $regex: searchTerm, $options: 'i' }; // Search by name, case-insensitive
        }



        const products = await Product.find(query)
            .skip((currentPage - 1) * perPage)
            .populate('category')
            .populate('subs')
            .sort(sort === 'isFeatured' ? 'createdAt' : [[sort, order]])
            .limit(perPage)
            .exec();

        res.json(products);
    } catch (e) {
        res.status(400).send({ error: e.message });
    }
};



exports.create = async (req, res) => {
    try {
        // Fetch the brand name based on the brand id provided in the request
        const brand = await Brand.findById(req.body.brand);
        // Generate the SKU
        const timestamp = Date.now().toString();
        const shortTimestamp = timestamp.slice(timestamp.length - 5);  // take last 5 digits
        let sku = "";

        let model = "";

        // If specifications is an array
        if (Array.isArray(req.body.specifications)) {
            // Find the model in specifications
            for (let i = 0; i < req.body.specifications.length; i++) {
                if (req.body.specifications[i].name.toLowerCase() === 'model') {
                    model = req.body.specifications[i].value;
                    break;
                }
            }
        }

        model = model.replace(/\s/g, '');  // Remove all spaces from the model

        if (model && model.trim() !== "") {
            // If model is specified and is not an empty string, use original approach
            sku = `${brand.name.slice(0, 3).toUpperCase()}-${model.slice(0, 3).toUpperCase()}-${req.body.color.toUpperCase()}-${shortTimestamp}`;
        } else {
            // If model is not specified or is an empty string, use the alternative approach
            sku = `${brand.name.slice(0, 3).toUpperCase()}-${req.body.category.slice(0, 3).toUpperCase()}-${req.body.color.toUpperCase()}-${shortTimestamp}`;
        }

        // Start the specifications array with the SKU
        let specifications = [{name: 'SKU', value: sku}];
        // Add the rest of the specifications provided in the request body
        if (Array.isArray(req.body.specifications)) {
            specifications = specifications.concat(req.body.specifications);
        }

        // Create the product
        const newProduct = await new Product({
            ...req.body, // spread the body
            slug: slugify(req.body.title), // generate the slug
            sku, // add the SKU
            specifications, // replace the original specifications array
        }).save();
        res.json(newProduct);
    } catch (err) {
        console.log(err);
        res.status(400).send({error: err.message});
    }
};


exports.listFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await Product.find({isFeatured: true})
            .sort({createdAt: -1})
            .populate('category')
            .populate('subs')
            .exec();

        res.json(featuredProducts);
    } catch (error) {
        res.status(400).send({error: error.message});
    }
};

exports.listAll = async (req, res) => {
    let products = await Product.find({})
        .sort({createdAt: -1})
        .limit(parseInt(req.params.count))
        .populate('category')
        .populate('subs')
        .exec();

    res.json(products);
};


// exports.listAll = async (req, res) => {
//     const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters (default to 1 if not provided)
//     const count = parseInt(req.query.count) || 12; // Get the number of products per page from the query parameters (default to 12 if not provided)
//
//     try {
//         const totalProducts = await Product.countDocuments(); // Count the total number of products
//
//         const products = await Product.find({})
//             .sort({createdAt: -1})
//             .skip((page - 1) * count)
//             .limit(count)
//             .populate("category")
//             .populate("subs")
//             .exec();
//
//         res.json({
//             products,
//             totalPages: Math.ceil(totalProducts / count),
//             currentPage: page,
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({error: "Internal server error"});
//     }
// };

exports.listAllByAdmin = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';
    const search = req.query.search || '';
    const category = req.query.category || '';

    const filter = {
        title: {$regex: search, $options: 'i'},
    };

    if (category) {
        filter['category'] = category;
    }

    let products = await Product.find(filter)
        .sort({[sort]: order === 'desc' ? -1 : 1})
        .skip(skip)
        .limit(limit)
        .populate('category')
        .populate('subs')
        .exec();
    const totalCount = await Product.countDocuments(filter).exec();
    res.json({products, totalCount});
};


exports.read = async (req, res) => {
    let product = await Product.findOne({slug: req.params.slug})
        .populate('category')
        .populate('subs')
        .populate('brand')
        .populate('rating.postedBy', '_id firstName surname')
        .exec();
    res.json(product);
};

exports.remove = async (req, res) => {

    try {
        const deletedProduct = await Product.findOneAndRemove(
            {slug: req.params.slug}
        ).exec();
        console.log(deletedProduct);
        res.json(deletedProduct);
    } catch (e) {
        res.status(400).send('Product delete failed');
    }
};

exports.update = async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updated = await Product.findOneAndUpdate(
            {slug: req.params.slug},
            req.body,
            {new: true}
        ).exec();
        res.json(updated);
    } catch (err) {
        res.status(400).send({error: err.message});
    }
};

exports.productsCount = async (req, res) => {
    try {
        let filter = {};

        if (req.query.filter) {
            if (req.query.filter === 'isFeatured') {
                filter = {isFeatured: true};
            }
        }

        let total = await Product.countDocuments(filter).exec();

        res.json(total);
    } catch (e) {
        res.status(400).send({error: e.message});
    }
};

exports.productStar = async (req, res) => {
    const product = await Product.findById(req.params.productId).exec();
    const user = await User.findById(req.auth._id).exec();
    const {star, value} = req.body;

    let existingRatingObject = product.rating.find(
        (ele) => ele.postedBy.toString() === user._id.toString()
    );

    if (existingRatingObject === undefined) {
        let ratingAdded = await Product.findByIdAndUpdate(
            product._id,
            {
                $push: {
                    rating: {
                        star,
                        value,
                        postedBy: user._id,
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                    },
                },
            },
            {new: true}
        ).exec();

        console.log('Rating added', ratingAdded);
        res.json(ratingAdded);
    } else {
        let ratingUpdated = await Product.updateOne(
            {rating: {$elemMatch: existingRatingObject}},
            {
                $set: {
                    'rating.$.star': star,
                    'rating.$.value': value,
                    'rating.$.updatedAt': Date.now(),
                },
            },
            {new: true}
        ).exec();
        res.json(ratingUpdated);
    }
};

exports.listRelated = async (req, res) => {
    try {
        const product = await Product.findById(req.params._id).exec();

        const related = await Product.find({
            _id: {$ne: product._id},
            category: {$in: product.category},
            quantity: {$gt: 1} // Filter products where quantity is greater than 1
        })
            .sort({createdAt: -1})
            .limit(6)
            .populate('category')
            .populate('subs')
            .exec();

        res.json(related);
    } catch (e) {
        res.status(400).send({error: e.message});
    }
};


const handleQuery = async (req, res, query) => {
    const products = await Product.find({$text: {$search: query}})
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('postedBy', '_id name')
        .exec();

    res.json(products);
};
const handlePrice = async (req, res, price) => {
    try {
        const products = await Product.find({
            price: {$gte: price[0], $lte: price[1]},
        })
            .populate('category', '_id name')
            .populate('subs', '_id name')
            .populate('postedBy', '_id name')
            .exec();
        res.json(products);
    } catch (e) {
        console.log(e);
    }
};
const handleCategory = async (req, res, category) => {
    try {
        const products = await Product.find({category})
            .populate('category', '_id name')
            .populate('subs', '_id name')
            .populate('postedBy', '_id name')
            .exec();
        res.json(products);
    } catch (e) {
        console.log(e);
    }
};
const handleSub = async (req, res, sub) => {
    try {
        const products = await Product.find({subs: sub})
            .populate('category', '_id name')
            .populate('subs', '_id name')
            .populate('postedBy', '_id name')
            .exec();
        res.json(products);
    } catch (e) {
        console.log(e);
    }
};
const handleShipping = async (req, res, shipping) => {
    try {
        const products = await Product.find({shipping})
            .populate('category', '_id name')
            .populate('subs', '_id name')
            .populate('postedBy', '_id name')
            .exec();
        res.json(products);
    } catch (e) {
        console.log(e);
    }
};

const handleStars = (req, res, stars) => {
    Product.aggregate([
        {
            $project: {
                document: '$$ROOT',
                floorAverage: {
                    $floor: {
                        $avg: '$rating.star',
                    },
                },
            },
        },
        {$match: {floorAverage: stars}},
    ])
        .limit(12)
        .exec((error, aggregates) => {
            console.log('Aggregates', aggregates);
            if (error) console.log('AGGREGATE ERROR', error);

            // Extract product IDs from the aggregates array
            const productIds = aggregates.map(aggregate => aggregate.document._id);

            Product.find({_id: {$in: productIds}})
                .populate('category', '_id name')
                .populate('subs', '_id name')
                .populate('postedBy', '_id name')
                .exec((error, products) => {
                    if (error) console.log('PRODUCT AGGREGATE ERROR', error);
                    res.json(products);
                });
        });
};

// const handleStars = (req, res, stars) => {
//     Product.aggregate([
//         {
//             $project: {
//                 document: '$$ROOT',
//                 floorAverage: {
//                     $floor: {
//                         $avg: '$rating.star',
//                     },
//                 },
//             },
//         },
//         {$match: {floorAverage: stars}},
//     ])
//         .limit(12)
//         .exec((error, aggregates) => {
//             console.log('Aggregates', aggregates);
//             if (error) console.log('AGGREGATE ERROR', error);
//             Product.find({_id: aggregates})
//                 .populate('category', '_id name')
//                 .populate('subs', '_id name')
//                 .populate('postedBy', '_id name')
//                 .exec((error, products) => {
//                     if (error) console.log('PRODUCT AGGREGATE ERROR', error);
//                     res.json(products);
//                 });
//         });
// };

exports.searchFilters = async (req, res) => {
    const {query, price, category, sub, stars, shipping, color, brand} =
        req.body;


    if (query) {
        console.log(query);
        await handleQuery(req, res, query);
    }
    if (price !== undefined) {
        await handlePrice(req, res, price);
    }
    if (category) {
        await handleCategory(req, res, category);
    }
    if (stars) {
        await handleStars(req, res, stars);
    }
    if (sub) {
        await handleSub(req, res, sub);
    }
    if (shipping) {
        await handleShipping(req, res, shipping);
    }
    // if (color) {
    //     await handleColor(req, res, color)
    // }
    // if (brand) {
    //     await handleBrand(req, res, brand)
    // }
};

exports.priceFilters = async (req, res) => {
    const lowest = await Product.find({})
        .sort({price: 1})
        .select('price')
        .limit(1)
        .exec();

    const highest = await Product.find({})
        .sort({price: -1})
        .select('price')
        .limit(1)
        .exec();

    let minMax = [];
    lowest.map((l) => {
        highest.map((h) => {
            minMax.push({lowestPriced: l.price, highestPriced: h.price});
        });
    });

    res.json(...minMax);
};
