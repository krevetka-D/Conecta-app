
import asyncHandler from 'express-async-handler';
import ChecklistItem from '../models/ChecklistItem.js';
import User from '../models/User.js';

const FREELANCER_CHECKLIST = [ 'OBTAIN_NIE', 'REGISTER_AUTONOMO', 'UNDERSTAND_TAXES', 'OPEN_BANK_ACCOUNT' ];
const ENTREPRENEUR_CHECKLIST = [ 'OBTAIN_NIE', 'FORM_SL_COMPANY', 'GET_COMPANY_NIF', 'RESEARCH_FUNDING' ];

const getChecklist = asyncHandler(async (req, res) => {
    let items = await ChecklistItem.find({ user: req.user._id });
    if (items.length === 0) {
        const user = await User.findById(req.user._id);
        const defaultItems = user.professionalPath === 'FREELANCER' ? FREELANCER_CHECKLIST : ENTREPRENEUR_CHECKLIST;
        const itemsToCreate = defaultItems.map(itemKey => ({
            user: req.user._id,
            itemKey
        }));
        await ChecklistItem.insertMany(itemsToCreate);
        items = await ChecklistItem.find({ user: req.user._id });
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


export { getChecklist, updateChecklistItem };