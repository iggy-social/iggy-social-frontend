import semver from 'semver';
const currentVersion = process.version;
const requiredVersion = '22.x';

if (!semver.satisfies(currentVersion, requiredVersion)) {
  console.error(`Error: Node.js version ${currentVersion} is not supported. Please use Node.js version 22.x.`);
  process.exit(1);
} else {
  console.log(`Using Node.js version ${currentVersion} (compatible with 22.x)`);
}