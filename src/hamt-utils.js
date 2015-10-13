import hamt from 'hamt';

export const merge = tries =>
  tries.reduce(
    (outerAcc, trie) => hamt.pairs(trie).reduce(
        (innerAcc, [key, value]) => hamt.set(key, value, innerAcc), 
        outerAcc),
    hamt.empty);