export function jsonToHtml(json: any): string {
    const obj = typeof json === 'string' ? JSON.parse(json) : json;
    
    function buildHtml(data: any, level: number = 0): string {
      const indent = '  '.repeat(level);
      
      if (Array.isArray(data)) {
        return `<ul>\n${data.map(item => 
          `${indent}  <li>${buildHtml(item, level + 1)}</li>`
        ).join('\n')}\n${indent}</ul>`;
      }
      
      if (typeof data === 'object' && data !== null) {
        return `<dl>\n${Object.entries(data).map(([key, value]) => 
          `${indent}  <dt>${key}</dt>\n${indent}  <dd>${buildHtml(value, level + 1)}</dd>`
        ).join('\n')}\n${indent}</dl>`;
      }
      
      return String(data);
    }
    
    return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>JSON Data</title>
  </head>
  <body>
  ${buildHtml(obj)}
  </body>
  </html>`;
  }
  
  // Usage
  const myJson = { name: "John", age: 30, hobbies: ["reading", "gaming"] };
  const html = jsonToHtml(myJson);