const axios = require("axios").default;

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const state = {
  simsimi: {},
  caklontong: {},
  caklontong_data: {},
};

module.exports = async (command = "", message, client) => {
  let res = null;
  let data = null;
  let msg = "";

  console.log(state);

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
        msg = `SELAMAT Jawaban anda benar\n\nSoal : *${
          state.caklontong_data[message.chatId].soal
        }*\nJawaban : ${
          state.caklontong_data[message.chatId].jawaban
        }\nDeskripsi : ${state.caklontong_data[message.chatId].deskripsi}`;
        client.reply(message.chatId, msg, message.id);
        if (!message.body.startsWith("/")) return { stop: true };
      } else {
        msg = `Jawaban anda salah\n\nSoal : *${
            state.caklontong_data[message.chatId].soal
          }*\nJawaban : ${
          state.caklontong_data[message.chatId].placeholderjawaban
        }`;
        client.reply(message.chatId, msg, message.id);
        if (!message.body.startsWith("/")) return { stop: true };
      }
    }

    if (body.startsWith("menyerah")) {
      msg = `Sayang sekali anda menyerah\n\nSoal : *${
        state.caklontong_data[message.chatId].soal
      }*\nJawaban : ${
        state.caklontong_data[message.chatId].jawaban
      }\nDeskripsi : ${state.caklontong_data[message.chatId].deskripsi}`;
      client.reply(message.chatId, msg, message.id);
      if (!message.body.startsWith("/")) return { stop: true };
    }

    if (body.startsWith("tanyabaru")) {
      msg =
        "Saya akan memberi pertanyaan, silahkan jawab dengan awalan kata jawab <jawaban>\nbalas menyerah untuk menyerah\nbalas tanyabaru untuk pertanyaan baru";
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

      msg = `Soal: *${state.caklontong_data[message.chatId].soal}*\nJawab: ${
        state.caklontong_data[message.chatId].placeholderjawaban
      }\n\nSilahkan menjawab dengan awalan kata jawab <jawaban>`;
      client.reply(message.chatId, msg, message.id);
    }
  }

  let secondArgs = message.body.split(" ")[1] || "";
  let thirdArgs = message.body.split(" ")[2] || "";

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
              "Mode Caklontong dan Simsimi tidak bisa digunakan bersamaan, menonaktifkan mode caklontong";
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
              "Mode Caklontong dan Simsimi tidak bisa digunakan bersamaan, menonaktifkan mode simsimi";
            client.reply(message.chatId, msg, message.id);
            return { stop: true };
          }

          state.caklontong[message.chatId] = true;
          msg =
            "Mode CakLontong dimulai, Saya akan memberi pertanyaan, silahkan jawab dengan awalan kata jawab <jawaban>\nbalas menyerah untuk menyerah\nbalas tanyabaru untuk pertanyaan baru";
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

          msg = `Soal: *${
            state.caklontong_data[message.chatId].soal
          }*\nJawab: ${
            state.caklontong_data[message.chatId].placeholderjawaban
          }\n\nSilahkan menjawab dengan awalan kata jawab <jawaban>`;
          client.reply(message.chatId, msg, message.id);

          return { stop: true };
          break;
        case "off":
          state.caklontong[message.chatId] = false;
          msg = "Mode CakLontong telah berhenti";
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
