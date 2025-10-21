#!/usr/bin/env node

import { SeederManager } from './seeder-manager';

async function main() {
  const seederManager = new SeederManager();
  const args = process.argv.slice(2);

  try {
    if (args.includes('--reset')) {
      await seederManager.resetSeeders();
      return;
    }

    if (args.includes('--list')) {
      const availableSeeders = seederManager.getAvailableSeeders();
      console.log('📋 Available seeders:');
      console.log('====================');
      availableSeeders.forEach((seeder, index) => {
        console.log(`${index + 1}. ${seeder}`);
      });
      return;
    }

    const seederArg = args.find((arg) => arg.startsWith('--seeder='));
    const seederName = seederArg?.split('=')[1];

    if (seederName) {
      await seederManager.runSpecificSeeder(seederName);
    } else {
      await seederManager.runAllSeeders();
    }
  } catch (error) {
    console.error('\n💥 Seeding process failed:');
    console.error(error);
    process.exit(1);
  }
}

void main();
