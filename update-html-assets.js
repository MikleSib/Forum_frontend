const fs = require('fs');
const path = require('path');

// Читаем build/index.html чтобы получить актуальные пути к assets
const buildIndexPath = path.join(__dirname, 'build/index.html');
const buildIndexContent = fs.readFileSync(buildIndexPath, 'utf8');

// Извлекаем пути к CSS и JS файлам
const cssMatch = buildIndexContent.match(/href="(\/assets\/index-[^"]+\.css)"/);
const jsMatch = buildIndexContent.match(/src="(\/assets\/index-[^"]+\.js)"/);
const vendorMatches = [...buildIndexContent.matchAll(/href="(\/assets\/[^"]*vendor[^"]*\.js)"/g)];
const apiMatch = buildIndexContent.match(/href="(\/assets\/api-[^"]+\.js)"/);
const utilsMatch = buildIndexContent.match(/href="(\/assets\/utils-[^"]+\.js)"/);
const bgMatch = buildIndexContent.match(/href="(\/assets\/bg-[^"]+\.webp)"/);

if (!cssMatch || !jsMatch) {
    console.error('Не удалось найти пути к CSS или JS файлам в build/index.html');
    process.exit(1);
}

const cssPath = cssMatch[1];
const jsPath = jsMatch[1];
const vendorPaths = vendorMatches.map(match => match[1]);
const apiPath = apiMatch ? apiMatch[1] : null;
const utilsPath = utilsMatch ? utilsMatch[1] : null;
const bgPath = bgMatch ? bgMatch[1] : '/assets/bg-BsQ2PN1b.webp';

console.log('Найденные пути к assets:');
console.log('CSS:', cssPath);
console.log('JS:', jsPath);
console.log('Vendors:', vendorPaths);
console.log('API:', apiPath);
console.log('Utils:', utilsPath);
console.log('BG:', bgPath);

// Функция для обновления HTML файла
function updateHtmlFile(filePath, pageTitle, pageDescription) {
    if (!fs.existsSync(filePath)) {
        console.log(`Файл ${filePath} не найден, пропускаем`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Исправляем проблемный base64 preload
    content = content.replace(
        /href="data:application\/octet-stream;base64,[^"]+"/,
        `href="${jsPath}"`
    );
    
    // Обновляем путь к фоновому изображению
    content = content.replace(
        /href="\/assets\/bg-[^"]+\.webp"/,
        `href="${bgPath}"`
    );
    
    // Обновляем основной JS файл (все варианты)
    content = content.replace(
        /src="\/assets\/index-[^"]+\.js"/g,
        `src="${jsPath}"`
    );
    content = content.replace(
        /href="\/assets\/index-[^"]+\.js"/g,
        `href="${jsPath}"`
    );
    
    // Обновляем CSS файл
    content = content.replace(
        /href="\/assets\/index-[^"]+\.css"/g,
        `href="${cssPath}"`
    );
    
    // Обновляем vendor файлы
    vendorPaths.forEach((vendorPath, index) => {
        const vendorType = vendorPath.includes('react-vendor') ? 'react-vendor' :
                          vendorPath.includes('router-vendor') ? 'router-vendor' :
                          vendorPath.includes('mui-vendor') ? 'mui-vendor' : 'vendor';
        
        content = content.replace(
            new RegExp(`href="\/assets\/${vendorType}-[^"]+\.js"`, 'g'),
            `href="${vendorPath}"`
        );
    });
    
    // Обновляем API файл
    if (apiPath) {
        content = content.replace(
            /href="\/assets\/api-[^"]+\.js"/g,
            `href="${apiPath}"`
        );
    }
    
    // Обновляем Utils файл  
    if (utilsPath) {
        content = content.replace(
            /href="\/assets\/utils-[^"]+\.js"/g,
            `href="${utilsPath}"`
        );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Обновлен файл: ${filePath}`);
}

// Обновляем все HTML файлы в public и build
const publicDir = path.join(__dirname, 'public');
const buildDir = path.join(__dirname, 'build');
const htmlFiles = [
    'news.html',
    'forum.html', 
    'marketplace.html',
    'profile.html'
];

// Обновляем файлы в public
htmlFiles.forEach(filename => {
    const filePath = path.join(publicDir, filename);
    updateHtmlFile(filePath);
});

// Обновляем файлы в build (если папка существует)
if (fs.existsSync(buildDir)) {
    htmlFiles.forEach(filename => {
        const filePath = path.join(buildDir, filename);
        updateHtmlFile(filePath);
    });
}

console.log('Все HTML файлы обновлены с актуальными путями к assets!'); 