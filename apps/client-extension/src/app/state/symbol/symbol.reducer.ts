import { Action } from '@ngrx/store';
import { ISymbolClient } from './symbol.model';
export const ADD_PRODUCT = 'ADD_PRODUCT';

export function addSymbolReducer(state: ISymbolClient[] = [], action) {
  switch (action.type) {
    case ADD_PRODUCT:
        return [...state, action.payload];
    default:
        return state;
    }
}