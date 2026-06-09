const ImageKit = require('imagekit');
const _config = require('../../config/config');

const client = new ImageKit({
    privateKey: _config.IMAGEKIT_PRIVATE_KEY,
    publicKey: _config.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: _config.IMAGEKIT_URL_ENDPOINT
});


const uploadFile = async (file, fileName) => {
    try {
        const result = await client.upload({
            file: file,
            fileName: fileName,
            folder: "spotify_music_service",
        });

        return result.url;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

module.exports = {
    uploadFile,
}