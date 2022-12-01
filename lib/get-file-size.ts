const fs = require('fs');

export function getFileSize(filePath: string): number {
  const fileInfo = fs.statSync(filePath);
  
  const fileSize = fileInfo.size;
  return fileSize;
}

