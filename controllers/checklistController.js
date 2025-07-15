
import asyncHandler from 'express-async-handler';
import ChecklistItem from '../models/ChecklistItem.js';
import User from '../models/User.js';

const FREELANCER_CHECKLIST = [ 'OBTAIN_NIE', 'REGISTER_AUTONOMO', 'UNDERSTAND_TAXES', 'OPEN_BANK_ACCOUNT' ];
const ENTREPRENEUR_CHECKLIST = [ 'OBTAIN_NIE', 'FORM_SL_COMPANY', 'GET_COMPANY_NIF', 'RESEARCH_FUNDING' ];

const getChecklist = asyncHandler(async (req, res) => {
    let items = await ChecklistItem.find({ userId: req.user.id });
    if (items.length === 0) {
        const user = await User.findById(req.user.id);
        const defaultItems = user.professionalPath === 'FREELANCER' ? FREELANCER_CHECKLIST : ENTREPRENEUR_CHECKLIST;
        const itemsToCreate = defaultItems.map(itemKey => ({ userId: req.user.id, itemKey }));
        await ChecklistItem.insertMany(itemsToCreate);
        items = await ChecklistItem.find({ userId: req.user.id });
    }
    res.status(200).json(items);
});

const updateChecklistItem = asyncHandler(async (req, res) => {
    const { itemKey } = req.params;
    const { isCompleted } = req.body;
    const item = await ChecklistItem.findOneAndUpdate(
        { userId: req.user.id, itemKey: itemKey },
        { isCompleted },
        { new: true }
    );
    if (!item) { res.status(404); throw new Error('Checklist item not found'); }
    res.status(200).json(item);
});

export { getChecklist, updateChecklistItem };