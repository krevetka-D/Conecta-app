import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import budgetReducer from './slices/budgetSlice';
import checklistReducer from './slices/checklistSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        budget: budgetReducer,
        checklist: checklistReducer,
    },
});