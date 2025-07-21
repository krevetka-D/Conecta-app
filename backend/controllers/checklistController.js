// backend/controllers/checklistController.js
import asyncHandler from 'express-async-handler';
import ChecklistItem from '../models/ChecklistItem.js';
import User from '../models/User.js';

const FREELANCER_CHECKLIST = [ 'OBTAIN_NIE', 'REGISTER_AUTONOMO', 'UNDERSTAND_TAXES', 'OPEN_BANK_ACCOUNT' ];
const ENTREPRENEUR_CHECKLIST = [ 'OBTAIN_NIE', 'FORM_SL_COMPANY', 'GET_COMPANY_NIF', 'RESEARCH_FUNDING' ];

const getChecklist = asyncHandler(async (req, res) => {
    let items = await ChecklistItem.find({ user: req.user._id });
    
    // If no items exist and user has a professional path, create them
    if (items.length === 0) {
        const user = await User.findById(req.user._id);
        
        if (user && user.professionalPath) {
            const defaultItems = user.professionalPath === 'FREELANCER' ? FREELANCER_CHECKLIST : ENTREPRENEUR_CHECKLIST;
            const itemsToCreate = defaultItems.map(itemKey => ({
                user: req.user._id,
                itemKey,
                isCompleted: false
            }));
            
            try {
                await ChecklistItem.insertMany(itemsToCreate);
                items = await ChecklistItem.find({ user: req.user._id });
            } catch (error) {
                console.error('Error creating default checklist items:', error);
                // Return empty array if creation fails
                return res.status(200).json([]);
            }
        }
    }
    
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
        // Create the item if it doesn't exist
        item = await ChecklistItem.create({
            user: req.user._id,
            itemKey: itemKey,
            isCompleted: isCompleted
        });
    } else {
        item.isCompleted = isCompleted;
        await item.save();
    }

    res.status(200).json(item);
});

// New function to create checklist items for a user
const createChecklistForUser = async (userId, professionalPath) => {
    if (!userId || !professionalPath) return;
    
    try {
        // Check if items already exist
        const existingItems = await ChecklistItem.find({ user: userId });
        if (existingItems.length > 0) return;
        
        const defaultItems = professionalPath === 'FREELANCER' ? FREELANCER_CHECKLIST : ENTREPRENEUR_CHECKLIST;
        const itemsToCreate = defaultItems.map(itemKey => ({
            user: userId,
            itemKey,
            isCompleted: false
        }));
        
        await ChecklistItem.insertMany(itemsToCreate);
    } catch (error) {
        console.error('Error creating checklist items for user:', error);
    }
};

export { getChecklist, updateChecklistItem, createChecklistForUser };