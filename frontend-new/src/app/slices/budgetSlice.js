import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/api';

export const fetchBudget = createAsyncThunk('budget/fetchBudget', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.getBudget();
        return data;
    } catch (error) {
        return rejectWithValue(error.response.data.message || 'Could not fetch budget');
    }
});

const budgetSlice = createSlice({
    name: 'budget',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBudget.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBudget.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchBudget.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default budgetSlice.reducer;