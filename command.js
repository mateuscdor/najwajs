const axios = require("axios").default;
const moment = require("moment");

const reformat = (string = "") => {
  string = string.replace(/_/g, " ").toLowerCase();
  string = string.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
  return string;
};

module.exports = async (command = "", message) => {
  if (!command) return "";
  let body = message.body;
  body = body.replace(`/${command}`, "").trim();

  let secondArgs = message.body.split(" ")[1] || "";
  secondArgs = secondArgs.trim();
  let thirdArgs = message.body.split(" ")[2] || "";
  thirdArgs = thirdArgs.trim();

  let res = null;
  let data = null;

  switch (command) {
    case "start":
    case "menu":
    case "help":
    case "halo":
      return "Halo, saya adalah Najwa Bot, maaf bot ini hanya khusus diperuntukkan untuk penggunaan pribadi";
      break;

    case "stalk":
      if (!secondArgs)
        return "Format: /stalk <nama sosmed> <username>\nContoh: /stalk instagram rasyid_rafi";
      switch (secondArgs) {
        case "ig":
        case "instagram":
          if (!thirdArgs)
            return "Format: /stalk instagram <username>\nContoh: /stalk instagram rasyid_rafi";
          res = await axios.get(
            `https://zenzapi.xyz/api/stalker/ig?username=${thirdArgs}&apikey=rasyidrafi`
          );
          data = res.data;

          if (data.status == "OK") {
            let hold = "";
            Object.keys(data.result.caption).forEach((key) => {
              if (key == "profile_ed" || key == "profile_hd") return;

              let val = "";
              switch (typeof data.result.caption[key]) {
                case "string":
                case "number":
                  val = data.result.caption[key];
                  break;

                case "boolean":
                  val = data.result.caption[key] ? "Ya" : "Tidak";
                  break;

                default:
                  break;
              }

              hold += `${reformat(key)}: ${val}\n`;
            });

            hold += "\nBy Najwa Bot";
            return {
              caption: hold,
              dataUrl: data.result.caption.profile_hd || "",
              filename: `${thirdArgs}.jpg`,
            };
          } else return "Username tidak ditemukan";
          break;

        default:
          return "Maaf saya hanya bisa mengambil data dari sosmed instagram saja";
          break;
      }

    case "darkjoke":
    case "darkjokes":
      return {
        caption: "",
        dataUrl: "https://zenzapi.xyz/api/random/darkjoke?apikey=rasyidrafi",
        filename: "darkjoke.jpg",
      };
      break;

    case "meme":
    case "memeindo":
      return {
        caption: "",
        dataUrl: "https://zenzapi.xyz/api/random/memeindo?apikey=rasyidrafi",
        filename: "darkjoke.jpg",
      };
      break;
      
    case "fakedata":
      let ccode = "en";
      if (secondArgs) {
        if (secondArgs == "en" || secondArgs == "ru") {          
          ccode = secondArgs;
        } else return "Maaf hanya dapat menginput kode *en* dan *ru*";
      } 
      res = await axios.get(
        `https://zenzapi.xyz/api/fakedata?country=${ccode}&apikey=rasyidrafi`
      );
      data = res.data;
      
      if (data.status == "OK") {
        let hold = "";
        Object.keys(data.result).forEach((key) => {
          if (key == "code" || key == "message") return;
          let val = "";
          
          switch (typeof data.result[key]) {
            case "string":
            case "number":
              val = data.result[key];
              break;

            case "boolean":
              val = data.result[key] ? "Ya" : "Tidak";
              break;

            default:
              break;
          }
          
          if (key == "birthday") val = moment(data.result.birthday).format("YYYY-MM-DD HH:mm:ss");

          hold += `${reformat(key)}: ${val}\n`;
        });

        hold += "\nBy Najwa Bot";
        return hold
      } else return "Fitur sedang tidak bisa digunakan";
      break;
      
    case "artinama":
      if (!secondArgs) return "Format: /artinama <nama kamu>\nContoh: /artinama budi";
      res = await axios.get(
        `https://zenzapi.xyz/api/artinama?text=${body}&apikey=rasyidrafi`
      );
      data = res.data;
      
      if (data.status == "OK") {
        let hold = `Nama: ${data.result.nama}\n\n${data.result.arti}`;
        return hold;
      }
      else return "Fitur sedang tidak bisa digunakan";
      break;
    
    case "artimimpi":
      if (!secondArgs) return "Format: /artimimpi <kata mimpi>\nContoh: /artimimpi mandi";
      res = await axios.get(
        `https://zenzapi.xyz/api/artimimpi?query=${body}&apikey=rasyidrafi`
      );
      data = res.data;
      
      if (data.status == "OK") {
        if (typeof data.result == "string") return data.result;
        let hold = `Mimpi: ${data.result.mimpi}\n\n${data.result.arti}\n\nSolusi:\n${data.result.solusi}`;
        return hold;
      }
      else return "Fitur sedang tidak bisa digunakan";
      break;

    default:
      if (message.body.startsWith("/")) {
        return "Maaf saya tidak dapat mengenali perintah yang anda kirimkan";
      }
      break;
  }
};
