/**
 * post controller — handles the HTTP request/response for /api/posts.
 * createCoreController gives us find, findOne, create, update, delete for free.
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::post.post');
