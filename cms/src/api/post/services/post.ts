/**
 * post service — reusable business logic (talks to the Document Service / DB).
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::post.post');
