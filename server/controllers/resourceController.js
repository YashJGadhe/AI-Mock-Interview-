/**
 * Resources Controller
 * Interview tips, question bank, and tutorials
 */

const Resource = require('../models/Resource');

// ── Get All Resources ─────────────────────────────────────────────
const getResources = async (req, res, next) => {
  try {
    const { type, category, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;

    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .sort({ isFeatured: -1, order: 1, likes: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Resource.countDocuments(filter),
    ]);

    // Group resources by type for easy frontend consumption
    const grouped = {
      tips: resources.filter((r) => r.type === 'tip'),
      questions: resources.filter((r) => r.type === 'question'),
      videos: resources.filter((r) => r.type === 'video'),
      articles: resources.filter((r) => r.type === 'article'),
      guides: resources.filter((r) => r.type === 'guide'),
    };

    res.json({ resources, grouped, total });
  } catch (error) {
    next(error);
  }
};

// ── Get Single Resource ───────────────────────────────────────────
const getResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    res.json({ resource });
  } catch (error) {
    next(error);
  }
};

module.exports = { getResources, getResource };
