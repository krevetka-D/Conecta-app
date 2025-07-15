
import asyncHandler from 'express-async-handler';
import Guide from '../models/Guide.js';
import ServiceDirectoryEntry from '../models/ServiceDirectoryEntry.js';

const getGuides = asyncHandler(async (req, res) => {
    const query = req.query.path ? { path: req.query.path } : {};
    const guides = await Guide.find(query).select('title slug');
    res.status(200).json(guides);
});

const getGuideBySlug = asyncHandler(async (req, res) => {
    const guide = await Guide.findOne({ slug: req.params.slug });
    if (guide) { res.status(200).json(guide); }
    else { res.status(404); throw new Error('Guide not found'); }
});

const getDirectory = asyncHandler(async (req, res) => {
    const entries = await ServiceDirectoryEntry.find(req.query);
    res.status(200).json(entries);
});

export { getGuides, getGuideBySlug, getDirectory };