const fs = require('fs');
const path = require('path');

function copyHtmlFiles(srcDir, destDir) {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    const items = fs.readdirSync(srcDir);

    for (const item of items) {
        const srcPath = path.join(srcDir, item);
        const destPath = path.join(destDir, item);
        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
            copyHtmlFiles(srcPath, destPath);
        } else if (item.endsWith('.html')) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied ${srcPath} to ${destPath}`);
        }
    }
}

copyHtmlFiles(path.join(__dirname, '../src'), path.join(__dirname, '../dist'));
