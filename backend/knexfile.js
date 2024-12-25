module.exports = {
  development: {
      client: 'pg',
      connection: {
          host: process.env.PG_HOST || 'localhost',
          port: process.env.PG_PORT || 5432,
          user: process.env.PG_USER || 'postgres',
          password: process.env.PG_PASSWORD || 'your_password',
          database: process.env.PG_DATABASE || 'your_database',
      },
      migrations: {
          directory: './migrations',
      },
      seeds: {
          directory: './seeds',
      },
  },
};
