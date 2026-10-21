import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        isAuthChecked: false,
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
            state.isAuthChecked = true;
        },
    },
});

export const { setUserData } = userSlice.actions;

export default userSlice.reducer;
