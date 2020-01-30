import cfg = require('../../../cfg/access.json')
import knex = require('knex')

/* Export database */
export class Database {

    /* The database */
    private static db = knex({
      /* Load db config */
      ... cfg.database,
      /* Use null as default */
      useNullAsDefault: true
    });
    
    /* Check authcode */
    public static async getAuthkeyByID(id: number) {
      /* Request */
      const candidate = await this.db
        .from('authkeys')
        .select('id', 'revoked', 'clearance')
        .where('id', id)
        .orderBy('clearance', 'desc')
        .first();

      /* Return */
      if (candidate) {
        return { 
          id: <number>candidate.id, 
          revoked: <boolean>candidate.revoked, 
          clearance: <number>candidate.clearance
        };
      } else {
        return null;
      }      
    }

    /* Check authcode */
    public static async getAuthkey(key: string) {
      /* Request */
      const candidate = await this.db
        .from('authkeys')
        .select('id', 'revoked', 'clearance')
        .where('hash', key)
        .orderBy('clearance', 'desc')
        .first();

      /* Return */
      if (candidate) {
        return { 
          id: <number>candidate.id, 
          revoked: <boolean>candidate.revoked, 
          clearance: <number>candidate.clearance
        };
      } else {
        return null;
      }      
    }

    /* Return the permission level of a task */
    public static async getTaskClearance(task: string) {
      /* Request */
      const candidate = await this.db
        .from('permissions')
        .select('level')
        .where('task', task)
        .first();
      /* Return */
      return candidate ? <number>candidate.level : null;
    }

    /* Check if authkey revoked */
    public static async isAuthkeyRevoked(id: number) {
      /* Request */
      const candidate = await this.db
        .from('authkeys')
        .select('revoked')
        .where('id', id)
        .first();
      /* Return */
      return candidate?.revoked == true;
    }

    /* Get ID for an endpoint */
    public static async getEndpointID(login: string) {
      /* Request */
      const candidate = await this.db
        .from('endpoints')
        .select('id', 'name', 'pass', 'salt', 'authid')
        .where('login', login)
        .first();

      /* Return */
      if (candidate) {
        return { 
          id: <number>candidate.id, 
          name: <string>candidate.name, 
          pass: <string>candidate.pass, 
          salt: <string>candidate.salt, 
          authid: <number | null>candidate.authid
        };
      } else {
        return null;
      }  
    }

    /* Register endpoint */
    public static async registerEndpoint(name: string, login:string, pass: string, salt: string, authid: number | null) {
      /* Make endpoint */
      const endpoint = { name, login, pass, salt, authid };
      /* Insert */
      await this.db('endpoints').insert(endpoint);
    }
}