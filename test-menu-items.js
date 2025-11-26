// test-menu-items.js - Test the menu-items API endpoint
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/menu-items',
    method: 'GET'
};

console.log('Testing GET /api/menu-items...\n');

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Status Message: ${res.statusMessage}\n`);
        
        if (res.statusCode === 200) {
            const menuItems = JSON.parse(data);
            console.log(`✓ Success! Found ${menuItems.length} menu items`);
            if (menuItems.length > 0) {
                console.log('\nSample item:');
                console.log(JSON.stringify(menuItems[0], null, 2));
            }
        } else {
            console.log('✗ Error response:');
            console.log(data);
        }
    });
});

req.on('error', (error) => {
    console.error('✗ Request failed:', error.message);
    console.log('\nMake sure the server is running on port 3000');
});

req.end();
