import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { checkAuth } from '../app/slices/authSlice';

export const useAuth = () => {
    const { isAuthenticated, loading, user, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    return { isAuthenticated, loading, user, token };
};