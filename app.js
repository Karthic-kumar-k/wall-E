const axios = require('axios');
const fs = require('fs');
const imgProbe = require('probe-image-size')


const isHDimage = async (url) => {
    let img_data = await imgProbe(url)
    .catch((err) => {console.log("Image quality not checked for url : ",url); return true})
    return img_data.height >= 1080 && img_data.width >= 1920;
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
    let urls = []
        resp = await axios.get('https://www.reddit.com/r/wallpapers/top/.json')
        childArray = resp.data.data.children
    
    console.log(childArray.length)

    for(var i=0 ; i<childArray.length ; i++){
        console.log("Fetching for Url count : ", i+1);
        if((childArray[i].data).hasOwnProperty("media_metadata")){
            console.log("This has multiple posts");
            var keyList = Object.keys(childArray[i].data.media_metadata);

            for(var j=0 ; j<keyList.length ; j++){
                var url = (childArray[i].data.media_metadata)[keyList[j].toString()].s.u;
                url = url.replace(/amp;/g,'')
                urls.push(url)
            }
        }
        else if((childArray[i].data).hasOwnProperty("preview")){
            
            var urll = childArray[i].data.preview.images[0].source.url
            urll = urll.replace(/amp;/g,'')
            urls.push(urll)
        }
    }
    
    return urls;
}

const download = async (url) =>{
    let isHD = await isHDimage(url);
    console.log("Trying to download ",url);
    if(isHD){
        let _ = await download_image(url, '../HD_Wallpapers/'+ (url.split("/")[url.split("/").length-1]).split('.')[0] + '.jpg');
        console.log("Image downloaded : ",url);
    }
    else{
        console.log(url," is Not a HD image. Skipping it.")
    }
}


(async () => {
    console.log("Preparing Application...");
    try {
        fs.mkdirSync('../HD_Wallpapers', 0o776);
    }
    catch{
        console.log("Folder already present")
    }

    let urls = await getUrls()
    
    console.log("Pictures Prepared. Starting Download for : ")
    console.log(urls);

    for(var i = 0 ; i<urls.length ; i++)
        await download(urls[i]);
})();
