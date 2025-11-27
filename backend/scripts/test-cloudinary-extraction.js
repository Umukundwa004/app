// Test Cloudinary deletion helper
require('dotenv').config();

const testUrl1 = 'https://res.cloudinary.com/demo/image/upload/v1234567890/rwanda-eats-restaurants/images/image-12345.jpg';
const testUrl2 = 'https://res.cloudinary.com/demo/video/upload/v1234567890/rwanda-eats-restaurants/videos/video-67890.mp4';
const testUrl3 = 'https://res.cloudinary.com/demo/raw/upload/v1234567890/rwanda-eats-restaurants/documents/menu-pdf-11111.pdf';

function extractPublicId(fileUrl) {
    if (!fileUrl) return null;
    
    try {
        const urlParts = fileUrl.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex === -1) return null;
        
        const publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/');
        const publicId = publicIdWithExt.split('.')[0];
        
        let resourceType = 'image';
        if (fileUrl.includes('/video/upload/')) {
            resourceType = 'video';
        } else if (fileUrl.includes('/raw/upload/')) {
            resourceType = 'raw';
        }
        
        return { publicId, resourceType };
    } catch (error) {
        console.error('Error extracting public_id:', error.message);
        return null;
    }
}

console.log('Test URL extraction:\n');
console.log('Image URL:', testUrl1);
console.log('Extracted:', extractPublicId(testUrl1));
console.log('\nVideo URL:', testUrl2);
console.log('Extracted:', extractPublicId(testUrl2));
console.log('\nPDF URL:', testUrl3);
console.log('Extracted:', extractPublicId(testUrl3));
