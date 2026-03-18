import { seedCategories } from './seed-categories';
import { seedWorks } from './seed-works';
import { seedCharacters } from './seed-characters';

async function main() {
  console.log('🎲 Running all seeds...');

  console.log('\n1. Categories');
  await seedCategories();

  console.log('\n2. Works');
  await seedWorks();

  console.log('\n3. Characters');
  await seedCharacters();

  console.log('\n✅ All seeds completed!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
