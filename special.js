const axios = require("axios").default;

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const state = {
  simsimi: {},
  caklontong: {},
  caklontong_data: {},
  music: {},
  music_data: {},
  instagram: {},
  instagram_data: {},
};

module.exports = async (command = "", message, client) => {
  let res = null;
  let data = null;
  let msg = "";

  if (state.simsimi[message.chatId]) {
    let body = message.body;
    res = await axios.get(
      `https://zenzapi.xyz/api/simisimi?text=${body}&apikey=rasyidrafi`
    );
    data = res.data;

    if (data.status == "OK") {
      msg = data.result.message;
      client.reply(message.chatId, msg, message.id);
      if (!message.body.startsWith("/")) return { stop: true };
    } else {
      state.simsimi[message.chatId] = false;
      msg =
        "Mode Simsimi sedang tidak bisa digunakan, menonaktifkan mode simsimi";
      client.reply(message.chatId, msg, message.id);
      if (!message.body.startsWith("/")) return { stop: true };
    }
  }
  if (state.caklontong[message.chatId]) {
    let body = message.body;

    if (body.startsWith("jawab")) {
      let jawaban = body.replace("jawab", "").trim();
      if (state.caklontong_data[message.chatId].jawaban == jawaban) {
        msg = `SELAMAT Jawaban anda benar\n\nSoal : *${state.caklontong_data[message.chatId].soal
          }*\nJawaban : ${state.caklontong_data[message.chatId].jawaban
          }\nDeskripsi : ${state.caklontong_data[message.chatId].deskripsi}`;
        client.reply(message.chatId, msg, message.id);
        if (!message.body.startsWith("/")) return { stop: true };
      } else {
        msg = `Jawaban anda salah\n\nSoal : *${state.caklontong_data[message.chatId].soal
          }*\nJawaban : ${state.caklontong_data[message.chatId].placeholderjawaban
          }`;
        client.reply(message.chatId, msg, message.id);
        if (!message.body.startsWith("/")) return { stop: true };
      }
    }

    if (body.startsWith("menyerah")) {
      msg = `Sayang sekali anda menyerah\n\nSoal : *${state.caklontong_data[message.chatId].soal
        }*\nJawaban : ${state.caklontong_data[message.chatId].jawaban
        }\nDeskripsi : ${state.caklontong_data[message.chatId].deskripsi}`;
      client.reply(message.chatId, msg, message.id);
      if (!message.body.startsWith("/")) return { stop: true };
    }

    if (body.startsWith("tanyabaru")) {
      msg =
        "Saya akan memberi pertanyaan, silahkan jawab dengan awalan kata *jawab <jawaban>*\nbalas *menyerah* untuk menyerah\nbalas *tanyabaru* untuk pertanyaan baru";
      client.reply(message.chatId, msg, message.id);

      res = await axios.get(
        "https://zenzapi.xyz/api/caklontong?apikey=rasyidrafi"
      );
      data = res.data;
      let { soal, jawaban, deskripsi } = data.result;
      let placeholderjawaban = "";

      let see = randomIntFromInterval(0, soal.length - 1);
      for (let i = 0; i < jawaban.length; i++) {
        let temp = " _ ";
        if (i == see) {
          temp = " " + jawaban[i] + " ";
        }
        placeholderjawaban += temp;
      }

      state.caklontong_data[message.chatId] = {
        soal: soal.toLowerCase(),
        jawaban: jawaban.toLowerCase(),
        placeholderjawaban: placeholderjawaban.toLowerCase(),
        deskripsi: deskripsi.toLowerCase(),
      };

      msg = `Soal: *${state.caklontong_data[message.chatId].soal}*\nJawab: ${state.caklontong_data[message.chatId].placeholderjawaban
        }\n\nSilahkan menjawab dengan awalan kata *jawab <jawaban>*`;
      client.reply(message.chatId, msg, message.id);
    }
  }
  if (state.music[message.chatId]) {
    let body = message.body.trim();
    if (body == "ya") {
      clearTimeout(state.music_data[message.chatId].timeout);
      await client.reply(message.chatId, `Sedang Mendownload *${state.music_data[message.chatId].title}*`, message.id);
      await client.sendMedia(message.chatId, state.music_data[message.chatId].url, "musik.mp3", "", "audio");
    } else if (body == "tidak") {
      clearTimeout(state.music_data[message.chatId].timeout);
      state.music[message.chatId] = false;
      state.music_data[message.chatId] = "";
      client.reply(message.chatId, "Oke, dibatalkan", message.id);
    }
  }
  if (state.instagram[message.chatId]) {
    let body = message.body.trim();
    let mainData = state.instagram_data[message.chatId].data;
    switch (body) {
      case "semua":
      case "all":
        clearTimeout(state.instagram_data[message.chatId].timeout);
        mainData.forEach(url => {
          let type = url.includes(".mp4") ? "video" : "image";
          client.sendMedia(message.chatId, url, "", "", type)
        })
        break;
    
      default:
        let custom = parseInt(body);
        if (isNaN(custom)) {
          client.reply(message.chatId, "Angka invalid", message.id);
        } else if (custom == 0 || custom > mainData.length) {
          client.reply(message.chatId, "Angka invalid", message.id);
        } else {
          let type = mainData[custom].includes(".mp4") ? "video" : "image";
          client.sendMedia(message.chatId, mainData[custom], "", "", type)
        }
        break;
    }
  }

  let secondArgs = message.body.split(" ")[1] || "";
  let thirdArgs = message.body.split(" ")[2] || "";
  let full = message.body;
  full = full.replace(`/${command}`, "").trim();

  switch (command) {
    case "simsimi":
    case "simisimi":
      if (!secondArgs) {
        msg = "Format: /simsimi <on|off>\nContoh: /simsimi on";
        client.reply(message.chatId, msg, message.id);
        return { stop: true };
      }
      switch (secondArgs) {
        case "on":
          if (state.caklontong[message.chatId]) {
            state.caklontong[message.chatId] = false;
            msg =
              "Mode cak lontong dan Simsimi tidak bisa digunakan bersamaan, menonaktifkan mode cak lontong";
            client.reply(message.chatId, msg, message.id);
            return { stop: true };
          }

          state.simsimi[message.chatId] = true;
          msg =
            "Mode Simsimi dimulai, Saya akan membalas pesan secara otomatis";
          client.reply(message.chatId, msg, message.id);
          return { stop: true };
          break;
        case "off":
          state.simsimi[message.chatId] = false;
          msg =
            "Mode Simsimi berhenti, Saya tidak akan membalas pesan secara otomatis";
          client.reply(message.chatId, msg, message.id);
          return { stop: true };
          break;
        default:
          msg = "Format: /simsimi <on|off>\nContoh: /simsimi on";
          client.reply(message.chatId, msg, message.id);
          return { stop: true };
          break;
      }
      break;

    case "music":
    case "musik":
      if (!secondArgs) {
        msg = "Format: /musik <query>\nContoh: /musik on my way";
        client.reply(message.chatId, msg, message.id);
        return { stop: true };
      }

      res = await axios.get(
        `https://zenzapi.xyz/downloader/play/playmp3?query=${full}&apikey=rasyidrafi`
      )
      data = res.data;
      if (data.status == "OK") {
        state.music[message.chatId] = true;
        let caption = `${data.result.title}\n\nChannel: ${data.result.channel}\nPublish: ${data.result.published}\n\nApakah ini benar yang anda maksud, balas *ya / tidak*, invalid dalam 10 detik`;
        await client.sendMedia(message.chatId, data.result.thumb, "ytmp3.jpg", caption, "image");
        state.music_data[message.chatId] = {
          timeout: setTimeout(() => {
            state.music[message.chatId] = false;
            state.music_data[message.chatId] = "";
            client.reply(message.chatId, "Invalid, 10 detik telah berlalu", message.id);
          }, 10000),
          url: data.result.url,
          title: data.result.title,
        };
      } else {
        msg = "Fitur sedang tidak bisa digunakan";
        client.reply(message.chatId, msg, message.id);
        return { stop: true };
      };

      break;

    case "instagram":
    case "ig":
      if (!secondArgs) {
        msg = "Format: /instagram <url posting>";
        client.reply(message.chatId, msg, message.id);
        return { stop: true };
      }

      res = await axios.get(
        `https://zenzapi.xyz/downloader/instagram2?url=${full}&apikey=rasyidrafi`
      )
      data = res.data;

      if (data.status == "OK") {
        console.log({
          data: data.data,
          full
        })
        switch (data.data.length) {
          case 0:
            msg = "Url tidak valid / akun private";
            client.reply(message.chatId, msg, message.id);
            return { stop: true };
            break;

          case 1:
            let type = data.data[0].includes(".mp4") ? "video" : "image";
            client.sendMedia(message.chatId, data.data[0], "", "", type)
            break;

          default:
            state.instagram[message.chatId] = true;
            let caption = `Terdapat ${data.data.length} postingan, silahkan balas dengan *urutan* postingan yang ingin di download, atau bisa membalas *semua* untuk mendownload semua postingan, invalid dalam 10 detik`;
            await client.reply(message.chatId, caption, message.id);

            state.instagram_data[message.chatId] = {
              timeout: setTimeout(() => {
                state.instagram[message.chatId] = false;
                state.instagram_data[message.chatId] = {};
                client.reply(message.chatId, "Invalid, 10 detik telah berlalu", message.id);
              }, 10000),
              data: data.data
            };
            break;
        }
      } else {
        msg = "Fitur sedang tidak bisa digunakan";
        client.reply(message.chatId, msg, message.id);
        return { stop: true };
      };
      break;

    case "caklontong":
    case "ttslontong":
      if (!secondArgs) {
        msg = "Format: /ttslontong <on|off>\nContoh: /ttslontong on";
        client.reply(message.chatId, msg, message.id);
        return { stop: true };
      }

      switch (secondArgs) {
        case "on":
          if (state.simsimi[message.chatId]) {
            state.simsimi[message.chatId] = false;
            msg =
              "Mode cak lontong dan Simsimi tidak bisa digunakan bersamaan, menonaktifkan mode simsimi";
            client.reply(message.chatId, msg, message.id);
            return { stop: true };
          }

          state.caklontong[message.chatId] = true;
          msg =
            "Mode cak lontong dimulai, Saya akan memberi pertanyaan, silahkan jawab dengan awalan kata *jawab <jawaban>*\nbalas *menyerah* untuk menyerah\nbalas *tanyabaru* untuk pertanyaan baru";
          client.reply(message.chatId, msg, message.id);

          res = await axios.get(
            "https://zenzapi.xyz/api/caklontong?apikey=rasyidrafi"
          );
          data = res.data;
          let { soal, jawaban, deskripsi } = data.result;
          let placeholderjawaban = "";

          let see = randomIntFromInterval(0, jawaban.length - 1);
          for (let i = 0; i < jawaban.length; i++) {
            let temp = " _ ";
            if (i == see) {
              temp = " " + jawaban[i] + " ";
            }
            placeholderjawaban += temp;
          }

          state.caklontong_data[message.chatId] = {
            soal: soal.toLowerCase(),
            jawaban: jawaban.toLowerCase(),
            placeholderjawaban: placeholderjawaban.toLowerCase(),
            deskripsi: deskripsi.toLowerCase(),
          };

          msg = `Soal: *${state.caklontong_data[message.chatId].soal
            }*\nJawab: ${state.caklontong_data[message.chatId].placeholderjawaban
            }\n\nSilahkan menjawab dengan awalan kata *jawab <jawaban>*`;
          client.reply(message.chatId, msg, message.id);

          return { stop: true };
          break;
        case "off":
          state.caklontong[message.chatId] = false;
          msg = "Mode cak lontong telah berhenti";
          client.reply(message.chatId, msg, message.id);
          return { stop: true };
          break;
        default:
          msg = "Format: /ttslontong <on|off>\nContoh: /ttslontong on";
          client.reply(message.chatId, msg, message.id);
          return { stop: true };
          break;
      }
      break;

    default:
      if (!state.simsimi[message.chatId] && !state.caklontong[message.chatId])
        return { stop: false };
      break;
  }
};
