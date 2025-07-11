import { useEffect, useReducer } from "react";

import AuthContext from "./FirebaseAuthContext";

import firebaseApp from "../firebase";

import {
  GoogleAuthProvider, onAuthStateChanged, getAuth, signOut, signInWithPopup
} from "firebase/auth";
import { addUserEntry, getUserEntryByEmail, getUserEntryById } from "../database";

const INITIALIZE = "INITIALIZE";
const IS_CHECKING = "IS_CHECKING";
const IS_ERROR = "IS_ERROR";

import { ADMIN_ROLE, USER_ROLE } from "../constant";

const auth = getAuth(firebaseApp);

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,

  is_checking: false, // To handle the initial loading state
  is_error: null, // To handle any errors during authentication
};

const reducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {

    case INITIALIZE:
      const { isAuthenticated, user } = payload;
      return {
        ...state,
        isAuthenticated,
        isInitialized: true,
        user,
      };

    case IS_CHECKING:
      return {
        ...state,
        is_checking: payload.is_checking,
      };

    case IS_ERROR:
      return {
        ...state,
        is_error: payload.is_error,
      };

  }

  return state;
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    
    // Listen for authentication state changes
    onAuthStateChanged(auth, async (user) => {
      // Check if checking state is true initially
      console.log(state.is_checking);
      if (state.is_checking) return;

      // Set checking state to true initially
      dispatch({ type: IS_CHECKING, payload: { is_checking: true } });
      
      // Check if page active is login page
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);

      const isLoginPage = path.includes("/dang-nhap");
      const isAdminPage = path.includes("/admin");

      const redirectTo = params.get("redirectTo") || '';
      const isRedirectToAdmin = redirectTo.includes("/admin");
      
      if (user) {
        let userEntry = await getUserEntryByEmail(user.email);
        if (!userEntry) {
          // Add user entry to database if it does not exist
          await addUserEntry({
            id: user.uid,
            email: user.email,
            role: USER_ROLE, // Default role
          });

          // Retrieve the user entry again after adding
          userEntry = await getUserEntryByEmail(user.email);
          user = { ...user, ...userEntry };
        }

        user['isAdmin'] = (userEntry.role === ADMIN_ROLE);

        dispatch({
          type: INITIALIZE,
          payload: { isAuthenticated: true, user },
        });

        if (userEntry) {
          const role = userEntry.role || USER_ROLE;

          if (isLoginPage) {
            // Redirect to dashboard if not on login page
            if (role === ADMIN_ROLE) {
              window.location.replace(redirectTo || "/admin/dashboard");
            }
            if (role === USER_ROLE) {
              window.location.replace(!isRedirectToAdmin ? redirectTo : "/dashboard");
            }
          } else {
            if (role === USER_ROLE && isAdminPage) {
              window.location.replace("/");
            }
          }
        } else {
          // If user entry does not exist, redirect to login page
          window.location.replace("/dang-nhap?redirectTo=" + encodeURIComponent(path));
        }

      } else {
        if (!isLoginPage) {
          window.location.replace("/dang-nhap?redirectTo=" + encodeURIComponent(path));
        }
      }

      // Set checking state to false after processing
      dispatch({ type: IS_CHECKING, payload: { is_checking: false } });
    });

  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const _signOut = async () => {
    await signOut(auth);
  };

  const _auth = { ...state.user };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "firebase",
        user: {
          id: _auth.uid,
          email: _auth.email,
          avatar: _auth.photoURL,
          displayName: _auth.displayName,
          role: "user",
          isAdmin: _auth.isAdmin || false,
        },
        signInWithGoogle,
        signOut: _signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
