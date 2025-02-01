// cli.js
import { Migrator } from './db/migrate.js';
import { Command } from 'commander';

const program = new Command();
const migrator = new Migrator();

program
  .command('up')
  .description('Run pending migrations')
  .action(async () => {
    try {
      await migrator.up();
      console.log('Migrations completed!');
    } catch (err) {
      console.error('Migration failed:', err.message);
      process.exit(1);
    }
  });

program
  .command('down')
  .description('Rollback all migrations')
  .action(async () => {
    try {
      await migrator.down();
      console.log('Rollback completed!');
    } catch (err) {
      console.error('Rollback failed:', err.message);
      process.exit(1);
    }
  });

program
  .command('create <name>')
  .description('Create a new migration')
  .action(async (name) => {
    try {
      await migrator.create(name);
    } catch (err) {
      console.error('Create failed:', err.message);
      process.exit(1);
    }
  });

program.parse(process.argv);