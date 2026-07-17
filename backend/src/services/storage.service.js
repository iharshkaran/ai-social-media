import ImageKit, { toFile } from '@imagekit/nodejs';


const client = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadImage(file) {

    const response = await client.files.upload({
        file: await toFile(file, 'file'),
        fileName: 'fileName.jpg',
    });
    return response;
}

export default uploadImage;