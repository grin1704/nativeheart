const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
const lines = schema.split('\n');
const result = [];

let inModel = false;
let modelName = null;
let modelLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Начало модели
  if (line.match(/^model \w+ \{/)) {
    inModel = true;
    const match = line.match(/^model (\w+) \{/);
    modelName = match[1];
    modelLines = [line];
    continue;
  }
  
  // Внутри модели
  if (inModel) {
    if (line.trim() === '}') {
      // Конец модели
      // Проверяем, есть ли уже @@map
      const hasMap = modelLines.some(l => l.includes('@@map('));
      
      if (!hasMap) {
        // Добавляем @@map
        const tableName = modelName
          .replace(/([A-Z])/g, '_$1')
          .toLowerCase()
          .substring(1);
        modelLines.push(`  @@map("${tableName}")`);
      }
      
      modelLines.push(line);
      result.push(...modelLines);
      inModel = false;
      modelName = null;
      modelLines = [];
    } else {
      modelLines.push(line);
    }
  } else {
    result.push(line);
  }
}

fs.writeFileSync('prisma/schema.prisma', result.join('\n'));
console.log('✅ Added @@map to all models');
