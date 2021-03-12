const TelegramBot = require('node-telegram-bot-api')
const libre = require('libreoffice-convert');
var docxConverter = require('docx-pdf');
const token = '1692390034:AAFDYkGyjYX2tz5d6EmFYzvZBwXZkTAsWEE'
const bot = new TelegramBot(token, {
    polling: true
})
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const request = require('request');


bot.on("message", async msg=>{
  const chatId = msg.chat.id;
  const messageId = msg.message_id;
  const text = msg.text;
  const name = msg.chat.first_name;
  const username = msg.chat.username;

  // this is used to download the file from the link
  const  download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
      request(url).pipe(fs.createWriteStream(path)).on('close', callback);
    });
    
  };

  bot.on('message', async (msg) => {
    let doc = ''  
    if (msg.document){
        console.log('Document:\n')
        console.log(msg.document)
        console.log('Begin')
        doc = msg.document
        const fileId = doc.file_id;
        const fileName = doc.file_name

        const newFilePath = 'pdfs/' + fileName.split('.')[0] + '.pdf'
        // there's other ways to get the file_id we just need it to get the download link an api request to get the "file directory" (file path)
        const res = await fetch(
          `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
        );
        // extract the file path
        const res2 = await res.json();
        const filePath = res2.result.file_path;

        // now that we've "file path" we can generate the download link
        const downloadURL = `https://api.telegram.org/file/bot${token}/${filePath}`;
        
        
        // download the file (in this case it's an image)
        download(downloadURL, path.join(__dirname, `${filePath}`), () =>
          docxConverter(filePath, newFilePath, function(err,result){
            if(err){
              console.log(err);
            }
            console.log('result'+result);
            bot.sendDocument(chatId, newFilePath)
          })
        );
      }
      
  });    
})