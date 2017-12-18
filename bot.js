/**
 * This is telegram bot for recognising text from images
 *
 * @author Vasyl Kutsyk
 * @licence MIT
 *
 */

const Telegraf = require('telegraf'),
    Telegram = require('telegraf/telegram'),
    request = require('request');

const azureCongitiveServiceKey = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    uriBase = "https://northeurope.api.cognitive.microsoft.com/vision/v1.0/ocr?language=unk",
    headers = {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": azureCongitiveServiceKey
    },
    options = {
        url: uriBase,
        method: 'POST',
        headers: headers
    };
const botKey = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    bot = new Telegraf(botKey),
    telegram = new Telegram(botKey);

const extractTextFromResponse = (response) => {
    let text = '';
    response.regions.forEach((region) => {
        region.lines.forEach((line) => {
            line.words.forEach((word) => {
                text += word.text + ' ';
            });
        });
    });
    return text;
};

bot.command('help', (ctx) => ctx.reply('This bot recognise text from image. Just send a picture for it.'));

bot.on('photo', (ctx) => {
    let receivedPhoto = ctx.update.message.photo;
    let receivedPhotoFileId = receivedPhoto[receivedPhoto.length - 1].file_id;
    telegram.getFileLink(receivedPhotoFileId).then((fileLink) => {
        options.body = `{"url": "${fileLink}"}`;
        request(options, (err, res, body) => {
            if (!err && res.statusCode === 200) {
                let response = JSON.parse(body);
                if (response.regions.length > 0)
                    ctx.reply(extractTextFromResponse(response));
                else
                    ctx.replyWithHTML("<code>No text was detected.</code>");
            }
            else {
                ctx.replyWithHTML(`<code>${err}</code>`);
            }
        });
    }).catch((error) => ctx.replyWithHTML(`<code>${error}</code>`))
});

bot.startPolling();
