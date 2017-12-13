/**
 * This is telegram bot for recognising text from images
 *
 * @author Vasyl Kutsyk
 * @licence MIT
 *
 * @link https://westus.dev.cognitive.microsoft.com/docs/services/56f91f2d778daf23d8ec6739/operations/56f91f2e778daf14a499e1fc
 * @link https://core.telegram.org/bots/api#getfile
 * @link https://github.com/telegraf/telegraf/tree/master/docs/examples
 * @link http://telegraf.js.org/#/?id=getfile
 *
 */


const Telegraf = require('telegraf'),
    Telegram = require('telegraf/telegram'),
    session = require('telegraf/session'),
    request = require('request'),
    uriBase = "https://northeurope.api.cognitive.microsoft.com/vision/v1.0/ocr?language=unk",
    headers = {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": "HERE SHOUDL BE YOUR AZURE SERVICE KEY"
    },
    options = {
        url: uriBase,
        method: 'POST',
        headers: headers
    },
    bot = new Telegraf("HERE SHOULD BE YOUR BOT KEY"),
    telegram = new Telegram("HERE SHOULD BE YOUR BOT KEY");

bot.use(session());

bot.command('help', (ctx) => ctx.reply('This bot recognise text from image'));

bot.on('photo', (ctx) => {
    let receivedPhoto = ctx.update.message.photo;

    telegram.getFileLink(receivedPhoto[receivedPhoto.length - 1].file_id).then((fileLink) => {
        options.body = `{"url": "${fileLink}"}`;
        request(options, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                let text = '';
                let resp = JSON.parse(body);
                resp.regions.forEach( (region) => {
                    region.lines.forEach( (line) => {
                        line.words.forEach( (word) => {
                            text += word.text + ' ';
                        });
                    });
                });
                ctx.reply(text);
            }
            else
                ctx.reply(error);
        });
    });
});

bot.startPolling();
