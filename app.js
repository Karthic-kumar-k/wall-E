const axios = require('axios');
const fs = require('fs');
const imgProbe = require('probe-image-size')
const example = require('./ex.json')


const isHDimage = async (url) => {
    let img_data = await imgProbe(url)
    .catch((err) => {console.log("Image quality not checked for url : ",url); return true})
    return img_data.height >= 1080 && img_data.height >= 1920;
}

const download_image = (url, image_path) =>{
    axios(
        {
            url : url, 
            method : 'GET',
            responseType: 'stream'
        })
    .then((response) =>{
        new Promise((resolve, reject) => {
            response.data
            .pipe(fs.createWriteStream(image_path))
            .on('finish', () => resolve("image downloaded"))
            .on('error', e => reject(e));
        })
    });
}

const getUrls = async () =>{
    let resp = await axios.get('https://www.reddit.com/r/wallpapers/top/.json')
        metadata = resp.data.data.children[0].data.media_metadata
        keyList = Object.keys(metadata);
    
    urls = []
    for(var i=0 ; i<keyList.length ; i++){
        var url = metadata[keyList[i]].s.u
        url = url.replace(/amp;/g,'')
        urls.push(url)
    }
    return urls;
}

const download = async (url) =>{
    let isHD = await isHDimage(url);
    console.log("Trying to download ",url);
    if(isHD){
        let _ = await download_image(url, '../wallpaperImages/'+ (url.split("/")[url.split("/").length-1]).split('.')[0] + '.jpg');
        //img1 = await download_image(url, '../wallpaperImages/'+ name_gen() + '.jpg');
        console.log("Image downloaded : ",url);
    }
    else{
        console.log(url," is Not a HD image. Skipping it.")
    }
}


(async () => {
    console.log("home method called");
    try {
        fs.mkdirSync('../wallpaperImages', 0o776);
    }
    catch{
        console.log("already present")
    }

    let urls = await getUrls()
    //url = ['https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png','https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?cs=srgb&dl=pexels-aleksandar-pasaric-325185.jpg&fm=jpg','https://preview.redd.it/cb1iwblmqjz91.png?width=11776&format=png&auto=webp&s=c6d681308544c03e567de719d11f482c7affde85','https://preview.redd.it/1r92hvkmqjz91.jpg?width=3840&format=pjpg&auto=webp&s=93fc0da3fabd8ffdb9c6cdff92016993ccb151c8']
    
    //console.log(urls)

    for(var i = 0 ; i<urls.length ; i++)
        await download(urls[i]);
})();