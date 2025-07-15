import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/api';

export const fetchChecklist = createAsyncThunk('checklist/fetchChecklist', async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.getChecklist();
        return data;
    } catch (error) {
        return rejectWithValue(error.response.data.message || 'Could not fetch checklist');
    }
});

const checklistSlice = createSlice({
    name: 'checklist',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchChecklist.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchChecklist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchChecklist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default checklistSlice.reducer;