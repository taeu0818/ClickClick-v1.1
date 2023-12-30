const runAjax = (url , type = 'get' , data = null) => $.ajax({url,  type , data}).catch(res => console.log(res));

const createImage = (src) => new Promise(res => {
    const img = $(`<img src="${src}">`)[0];
    img.onload = () => res(img);
})