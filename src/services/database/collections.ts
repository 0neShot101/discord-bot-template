import { mongodb } from './mongodb';

/** A list of collections in the MongoDB database */
export const userCollection = mongodb.collection('users');
