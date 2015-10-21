import {ADDED, REMOVED, CLEARED} from './collection-delta-kinds.js';

/**
 * Creates a new added modification.
 * @param {string} key - The key used to refer to the object in the collection for removal etc.
 * @param  value - The value to store in the collection
 * @return {Object} The modification
 */
export const added = (key, value) => ({kind: ADDED, key, value});

/**
 * Creates a new removed modification.
 * @param {string} key - The key used to find the value for removal
 * @return {Object} The modification
 */
export const removed = key => ({kind: REMOVED, key});

/**
 * Creates a new cleared modification.
 * @return {Object} The modification
 */
export const cleared = () => ({kind: CLEARED});