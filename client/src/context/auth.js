import React, { useReducer, useEffect, createContext } from 'react';

const initialState = {
    user: null,
};

const AuthContext = createContext({
    user: null,
    login: (userData) => {},
    logout: () => {},
    refreshUserData: () => {},
});

function authReducer(state, action) {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                user: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
            };
        default:
            return state;
    }
}

function AuthProvider(props) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        console.log('getting user data');
        fetch('/getuser')
            .then((res) => res.json())
            .then((data) => {
                login(data);
            })
            .catch((data) => {
                login('NoUser');
            });
    }, []);

    function login(userData) {
        dispatch({
            type: 'LOGIN',
            payload: userData,
        });
    }

    function logout() {
        dispatch({ type: 'LOGOUT' });
    }

    function refreshUserData() {
        fetch('/getuser')
            .then((res) => res.json())
            .then((data) => login(data))
            .catch((data) => login('NoUser'));
    }

    return <AuthContext.Provider value={{ user: state.user, login, logout, refreshUserData }} {...props} />;
}

export { AuthContext, AuthProvider };
