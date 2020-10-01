const key = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
}).key;

const content = document.getElementById("content");
const dom_tags = {
  img: '<img class="img_class"',
  lable: "<lable ",
  close_lable: "</lable>",
  button: "<button ",
  close_button: "</button>",
  br: "<br>",
  hr: "<hr>"
}

var currentData = [];

async function run(){
  const r = await fetch(`/info/${key}`);
  const info = await r.json();
  currentData = info;
  console.log(info);
  var to_add = "";
  info.forEach(element => {
    to_add +=`<div id=${element.name}_div>` +dom_tags.img + `id=i_${element.name} src="https://vedant-test.glitch.me/images/${element.name}.jpeg/${key}" >` +
      dom_tags.br+
      dom_tags.lable + `id = "l_${element.name}_name"> node name: ${element.name}` + dom_tags.close_lable +dom_tags.br+
      dom_tags.lable + `id = "l_${element.name}_update"> update status: ${element.update}` + dom_tags.close_lable +dom_tags.button + `type = "button" onclick="toggleAttr('${element.name}','update')">TOGGLE`+ dom_tags.close_button + dom_tags.br+
      dom_tags.lable + `id = "l_${element.name}_status_g"> connection: ${element.status_g}` + dom_tags.close_lable +dom_tags.br+
      dom_tags.lable + `id = "l_${element.name}_start_up"> start_up: ${element.start_up}` + dom_tags.close_lable + dom_tags.button + `type = "button" onclick="toggleAttr('${element.name}','start_up')">TOGGLE`+ dom_tags.close_button +dom_tags.br +
      dom_tags.lable + `id = "l_${element.name}_kill"> kill: ${element.kill}` + dom_tags.close_lable +dom_tags.button + `type = "button" onclick="toggleAttr('${element.name}','kill')">TOGGLE`+ dom_tags.close_button +dom_tags.br +
      dom_tags.hr      
  });
  content.innerHTML = to_add;
  setInterval(updateInfo, 1000);
}

async function updateInfo(){
  const r = await fetch(`/info/${key}`);
  const info = await r.json();
  currentData = info;
  
  info.forEach(element => {
    changeImage(element.name);
    document.getElementById(`l_${element.name}_name`).innerHTML = `node name: ${element.name}`;
    document.getElementById(`l_${element.name}_update`).innerHTML = `update status: ${element.update}`;
    document.getElementById(`l_${element.name}_status_g`).innerHTML = `connection: ${element.status_g}`;
    document.getElementById(`l_${element.name}_start_up`).innerHTML = `start_up: ${element.start_up}`;
    document.getElementById(`l_${element.name}_kill`).innerHTML = `kill: ${element.kill}`;
  })
}

async function toggleAttr(name, attr){
  var update_to = "";
  currentData.forEach(element => {
    if(element.name = name && element[attr] == "true"){
      update_to = "false";
    }else{
      update_to = "true";
    }
  })
  
  fetch(`/set_status/${name}/${attr}/${update_to}/${key}`);
}

async function changeImage(id) {
  console.log("changing");
  const filepath = id + ".jpeg";
  var request = new Request(`https://vedant-test.glitch.me/images/${filepath}/${key}`);
  fetch(request).then(response => {
    response.arrayBuffer().then(buffer => {
      var base64Flag = "data:image/jpeg;base64,";
      var imageStr = arrayBufferToBase64(buffer);
      var doms = document.querySelectorAll(".img_class");
      doms.forEach(element => {
        if(element.id == `i_${id}`){
          element.src = base64Flag + imageStr;
        }
      })
    });
  });
}
function arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = [].slice.call(new Uint8Array(buffer));

  bytes.forEach(b => (binary += String.fromCharCode(b)));

  return window.btoa(binary);
}
