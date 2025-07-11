import { configureStore } from '@reduxjs/toolkit'

import appReducer from './features/app';
import employeeReducer from './features/employee';

export const store = configureStore({
  reducer: {
    app: appReducer,
    employee: employeeReducer,
  },
})