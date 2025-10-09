const fs = require('fs').promises;
const path = require('path');

const deleteFile = async (filePath) => {
  try {
    if (!filePath) return;

    // Remove the '/uploads' prefix if present
    const relativePath = filePath.startsWith('/uploads') ? filePath.substring(8) : filePath;
    const fullPath = path.join(__dirname, '../../uploads', relativePath);

    await fs.unlink(fullPath);
    console.log('File deleted successfully:', fullPath);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw error, just log it
  }
};

module.exports = {
  deleteFile
};
