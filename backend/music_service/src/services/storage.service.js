const ImageKit = require('@imagekit/nodejs');
const _config = require('../../config/config');

const client = new ImageKit({
    privateKey: _config.IMAGEKIT_PRIVATE_KEY,
});


const uploadImage = async (file) => {
    try {
        const url = client.helper.buildSrc({
            urlEndpoint: _config.IMAGEKIT_URL_ENDPOINT,
            src: file.path,
        });
        return url;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

module.exports = {
    uploadImage,
}