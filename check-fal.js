const falModule = require('@fal-ai/client');
console.log('Exports:', Object.keys(falModule));
if (falModule.fal) {
    console.log('fal object keys:', Object.keys(falModule.fal));
}
