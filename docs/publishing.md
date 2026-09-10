# Publishing Guide

When you are ready to share your Node-RED ZKTeco package with the world, follow these exact steps.

## 1. Prepare for Release
1. **Version Bump:** Ensure you have updated the version number in `package.json`. Use Semantic Versioning:
   - `1.0.1` for bug fixes.
   - `1.1.0` for new features (like adding a new SDK operation).
   - `2.0.0` for breaking changes (like changing how the config node works).
2. **Build:** Run `npm run build` to ensure the `dist/` folder is perfectly up-to-date.
3. **Dry Run:** Run `npm pack`. This creates a `.tgz` file. Open it to ensure no sensitive files (like `.env` or hardcoded credentials in test files) accidentally snuck into the final package.

## 2. GitHub Release
Node-RED strongly prefers that all published packages are open source and hosted on GitHub.
1. Commit all your code: `git commit -m "Release v1.0.0"`
2. Tag the release: `git tag v1.0.0`
3. Push to GitHub: `git push origin main --tags`
4. On GitHub, navigate to "Releases" and create a new Release based on your tag. Include a brief summary of what changed.

## 3. npm Registry Publish
1. Create a free account at [npmjs.com](https://www.npmjs.com/).
2. Open your terminal in the package directory.
3. Login to npm: 
   ```bash
   npm login
   ```
4. Publish the package:
   ```bash
   npm publish
   ```
   *(Note: You cannot overwrite a version. If you publish `1.0.0` and find a bug 5 minutes later, you MUST change `package.json` to `1.0.1` and publish again).*

## 4. Node-RED Flow Library Indexing
Node-RED maintains a central searchable directory of all community nodes at [flows.nodered.org](https://flows.nodered.org/).
You do **not** need to manually upload your code to Node-RED!

When you run `npm publish`, the Node-RED servers automatically scan the npm registry looking for packages that have `"node-red"` in their keywords array (which we added to our `package.json`). Within a few hours of publishing, your package will automatically appear on the official Node-RED library page, and users around the world will be able to install it directly from their Node-RED palette manager.
