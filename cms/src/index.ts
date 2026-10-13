import type { Core } from '@strapi/strapi';

// Actions the *Public* role (anyone without a token) is allowed to call.
// We only allow reading. Creating posts requires an API token.
const PUBLIC_POST_ACTIONS = ['api::post.post.find', 'api::post.post.findOne'];

export default {
  /**
   * Runs before the app is initialized — good for extending code
   * (custom fields, plugins, middlewares).
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * Runs right before the server starts — good for seeding data
   * or setting permissions, like we do here.
   *
   * (You can do the same by hand in the admin panel:
   *  Settings → Users & Permissions → Roles → Public → Post → tick find/findOne)
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    for (const action of PUBLIC_POST_ACTIONS) {
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action, role: publicRole.id } });

      if (!existing) {
        await strapi.db
          .query('plugin::users-permissions.permission')
          .create({ data: { action, role: publicRole.id } });
        strapi.log.info(`Granted Public role: ${action}`);
      }
    }
  },
};
