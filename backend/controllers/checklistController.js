import asyncHandler from 'express-async-handler';
import ChecklistItem from '../models/ChecklistItem.js';
import User from '../models/User.js';

const FREELANCER_CHECKLIST = [ 'OBTAIN_NIE', 'REGISTER_AUTONOMO', 'UNDERSTAND_TAXES', 'OPEN_BANK_ACCOUNT' ];
const ENTREPRENEUR_CHECKLIST = [ 'OBTAIN_NIE', 'FORM_SL_COMPANY', 'GET_COMPANY_NIF', 'RESEARCH_FUNDING' ];

//Initializing checklist items
const initializeChecklist = asyncHandler(async (req, res) => {
    const { selectedItems } = req.body;
    
    if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
        res.status(400);
        throw new Error('Please select at least one checklist item');
    }
    
    const user = await User.findById(req.user._id);
    if (!user || !user.professionalPath) {
        res.status(400);
        throw new Error('Professional path not set');
    }
    
    // Get valid items for the user's professional path
    const validItems = user.professionalPath === 'FREELANCER' ? FREELANCER_CHECKLIST : ENTREPRENEUR_CHECKLIST;
    
    // Filter selected items to only include valid ones
    const itemsToCreate = selectedItems
        .filter(itemKey => validItems.includes(itemKey))
        .map(itemKey => ({
            user: req.user._id,
            itemKey,
            isCompleted: false
        }));
    
    if (itemsToCreate.length === 0) {
        res.status(400);
        throw new Error('No valid checklist items selected');
    }
    
    try {
        // Remove any existing items first to avoid duplicates
        await ChecklistItem.deleteMany({ user: req.user._id });
        
        // Create new items
        const createdItems = await ChecklistItem.insertMany(itemsToCreate);
        
        res.status(201).json(createdItems);
    } catch (error) {
        console.error('Error initializing checklist:', error);
        res.status(500);
        throw new Error('Failed to initialize checklist');
    }
});

const getChecklist = asyncHandler(async (req, res) => {
    let items = await ChecklistItem.find({ user: req.user._id });
    
    // Don't auto-create items here anymore - they should be created during onboarding
    res.status(200).json(items);
});

const updateChecklistItem = asyncHandler(async (req, res) => {
    const { itemKey } = req.params;
    const { isCompleted } = req.body;

    if (!req.user || !req.user._id) {
        res.status(401);
        throw new Error('User not authenticated');
    }

    let item = await ChecklistItem.findOne({
        user: req.user._id,
        itemKey: itemKey
    });

    if (!item) {
        // Don't auto-create - item should exist already
        res.status(404);
        throw new Error('Checklist item not found');
    } else {
        item.isCompleted = isCompleted;
        await item.save();
    }

    res.status(200).json(item);
});

//  Creating checklist items for a user (called during onboarding completion)
const createChecklistForUser = async (userId, selectedItems) => {
    if (!userId || !selectedItems || selectedItems.length === 0) return;
    
    try {
        // Check if items already exist
        const existingItems = await ChecklistItem.find({ user: userId });
        if (existingItems.length > 0) return existingItems;
        
        const user = await User.findById(userId);
        if (!user || !user.professionalPath) return;
        
        const validItems = user.professionalPath === 'FREELANCER' ? FREELANCER_CHECKLIST : ENTREPRENEUR_CHECKLIST;
        
        const itemsToCreate = selectedItems
            .filter(itemKey => validItems.includes(itemKey))
            .map(itemKey => ({
                user: userId,
                itemKey,
                isCompleted: false
            }));
        
        const createdItems = await ChecklistItem.insertMany(itemsToCreate);
        return createdItems;
    } catch (error) {
        console.error('Error creating checklist items for user:', error);
        throw error;
    }
};

export { getChecklist, updateChecklistItem, createChecklistForUser, initializeChecklist };