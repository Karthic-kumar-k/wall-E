const axios = require('axios');
const fs = require('fs');
const imgProbe = require('probe-image-size')
var argument = process.argv ;


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
	subbreddit = argument[2] === undefined ? "wallpapers" : argument[2]
	filter1 = argument[3] === undefined ? "top" : argument[3]
	filter2 = argument[4] === undefined ? "hour" : argument[4]
	url = 'https://www.reddit.com/r/'+subbreddit+'/'+filter1+'/.json?t='+filter2
        resp = await axios.get(url)
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
    let isHD = await isHDimage(url)
	isNonHDWanted = argument[5] === undefined || argument[5] === "n" ? false : true; 
    console.log("Trying to download ",url);
    if(isNonHDWanted || isHD){
        let _ = await download_image(url, '../HD_Wallpapers/'+ (url.split("/")[url.split("/").length-1]).split('.')[0] + '.jpg');
        console.log("Image downloaded : ",url);
    }
    else{
        console.log(url," is Not a HD image. Skipping it.")
    }
}

function printHelpMessage(){
	console.log("First argument is Subreddit name. Default is wallpapers");
	console.log("Second argument is filter 1. Values can be hot | new | top. Default is top");
	console.log("Third argument is filter 2. Values can be hour | day | week | month | year | all. Default is hour");
	console.log("Fourth argument decides whether non HD images can be downloaded. Values can be y | n. Default is n");
}

(async () => {
    console.log("Preparing Application...");
    if(argument[2] === "help")
	    printHelpMessage();
    else{
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
    }
})();
