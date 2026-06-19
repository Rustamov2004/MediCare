const fs = require('fs');
const path = require('path');

const updateColorsInDir = (dir) => {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            updateColorsInDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // Replace hardcoded light colors with CSS variables
            content = content.replace(/#fff(fff)?/gi, 'var(--surface)');
            content = content.replace(/#(f3f4f6|f1f5f9)/gi, 'var(--surface2)');
            content = content.replace(/#(1e293b|0f172a|1e3a5f|333(333)?)/gi, 'var(--text)');
            content = content.replace(/#64748b/gi, 'var(--muted)');
            content = content.replace(/#(e2e8f0|cbd5e1)/gi, 'var(--border)');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    });
};

updateColorsInDir(path.join(__dirname, 'frontend/src'));
console.log('Done');
