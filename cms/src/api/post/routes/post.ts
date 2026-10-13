/**
 * post router — maps URLs to controller actions:
 *   GET    /api/posts              -> find
 *   GET    /api/posts/:documentId  -> findOne
 *   POST   /api/posts              -> create
 *   PUT    /api/posts/:documentId  -> update
 *   DELETE /api/posts/:documentId  -> delete
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::post.post');
