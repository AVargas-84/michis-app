//Axios: Como usar para optimizar el código de Michis App

const api = axios.create({ //Crear instancia de axios con la url base de thecatapi
    baseURL: 'https://api.thecatapi.com/v1',
  });

const MY_API_KEY = 'live_qL4SMY2yMORz7txSI2tYPqo7d44B1OA5IK1cZqcuWzrfHLfFdCSE11KrsVO0nG0Q';
api.defaults.headers.common['x-api-key'] = MY_API_KEY; //usar los métodos de axios para definir el header de autorización

const API_URL_RANDOM = 'https://api.thecatapi.com/v1/images/search?limit=2';
const API_URL_FAVS = 'https://api.thecatapi.com/v1/favourites';
const API_URL_UPLOAD = 'https://api.thecatapi.com/v1/images/upload';

const catBtn = document.getElementById('catBtn');

const spanError = document.getElementById('error');

async function loadRandomCats(){ 
    const res = await fetch(API_URL_RANDOM); //Guardamos la respuesta de la promesa fetch en una var res, y le ponemos await para esperar la respuesta
    
    if(res.status !== 200){ //Validar si hubo un error, y cambiar el span para avisar al usuario
        spanError.innerHTML = "Hubo un error: " + res.status + " " + await res.text();
    } else{ //Si no hay ningún error, cargar las imágenes
        const data = await res.json(); //Guardamos en data la respuesta de json. data tiene toda la información que viene de la API en estructura JSON, pero si genera error antes, data no funciona
        const img1 = document.getElementById("cat1");
        const img2 = document.getElementById("cat2");
        const img3 = document.getElementById("cat3");
        const img4 = document.getElementById("cat4");
        const btn1 = document.getElementById("btn1");
        const btn2 = document.getElementById("btn2");
        const btn3 = document.getElementById("btn3");
        const btn4 = document.getElementById("btn4");
        img1.src=data[0].url;
        img2.src=data[1].url;
        img3.src=data[2].url;
        img4.src=data[3].url;

        btn1.onclick = () => saveFavCat(data[0].id); //Usamos arrow function por que si no, savFavCat se ejecuta sola, sin darle click al boton.
        btn2.onclick = () => saveFavCat(data[1].id);
        btn3.onclick = () => saveFavCat(data[2].id);
        btn4.onclick = () => saveFavCat(data[3].id);
    }
}

catBtn.onclick = loadRandomCats;

async function loadFavCats(){
    const res = await fetch(API_URL_FAVS,{
        method: 'GET',
        headers: {
            'x-api-key': MY_API_KEY,
        }
    });
    
    if(res.status !== 200){ //Validar si hubo un error, y cambiar el span para avisar al usuario
        spanError.innerHTML = "Hubo un error: " + res.status + " " + await res.text();
    } else{
        const data = await res.json();
        console.log('Favs:');
        console.log(data);
        const section = document.getElementById('favMichis');
        section.innerHTML = ""; //Vaciamos la sección para que cuando recargue con la función loadFavCats dentro de saveFav o delete, no se repitan las imágenes, y no toque recargar la pg.
       

        data.forEach(michi => {
            const div = document.createElement('div');
            const img = document.createElement('img');
            const btn = document.createElement('button');
            const btnIcon = document.createElement('img');

            btnIcon.setAttribute('src', './icons/remove.png');
            btnIcon.setAttribute('alt', 'remove from favorites');
            btnIcon.setAttribute('class', 'w-8 h-8');
            btn.appendChild(btnIcon);
            btn.setAttribute('class', "bg-red-500 hover:bg-rose-900 rounded px-5 py-1 m-5");
            btn.setAttribute('title', 'Remove From Favorites');
            btn.onclick = () => deleteFavCat(michi.id);
            img.src = michi.image.url;
            img.setAttribute('class', 'aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-7/8');
            div.setAttribute('class', 'flex flex-col items-center');
            div.appendChild(img);
            div.appendChild(btn);
            section.appendChild(div);
        });
    }
}

async function saveFavCat(id){
    //Axios
    const {data, status} = await api.post('/favourites', { //En vez de pasar todos los datos (method, headers, post), se usa el método de axios con los parámetros: 1. parte adicional de la url.
        image_id: id,    // 2. Contenido del body sin stringify, axios lo hace. Y ya no toca usar res.json(), y el objeto ya trae a data y status
    }); 
    /*
    const res = await fetch(API_URL_FAVS, { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': MY_API_KEY,
        },
        body: JSON.stringify({
            image_id: id,
        }),
    });
    const data = await res.json();
*/
    
    if(status !== 200){ 
        spanError.innerHTML = "Hubo un error: " + status + " " + data.message;
    } else {
        console.log('Cat saved to favorites');
        loadFavCats(); //Se llama de nuevo a la función para que recargue automáticamente los favoritos.
    }
}

const API_URL_DEL_FAVS = (id) => `https://api.thecatapi.com/v1/favourites/${id}`; //Usamos arrow function para hacer la url dinámica, y ponerle el id del que queremos borrar

async function deleteFavCat(id) {    
    const res = await fetch(API_URL_DEL_FAVS(id), {
        method: 'DELETE',
        headers: {
            'x-api-key': MY_API_KEY,
        },
    });
    if(res.status !== 200){ 
        spanError.innerHTML = "Hubo un error: " + res.status + " " + await res.text();
    } else {
        console.log('Cat removed from favorites');
        loadFavCats();
    }  
}

async function uploadCatPic() { //Usaremos el superprototipo FormData
    const form = document.getElementById('uploadForm');
    const formData = new FormData(form); //Toma todos los inputs del form, y los guarda en el nuevo objeto creado con el prototipo
    console.log(formData.get('file'));

    const res = await fetch(API_URL_UPLOAD, {
        method: 'POST',
        headers: {
            //'Content-Type': 'multipart/form-data', //No es necesario usarla, ya que al pasarle el formData, el fetch automáticamente entiende el tipo de datos
            'x-api-key': MY_API_KEY,
        },
        body: formData,
    });
    if(res.status !== 201){ 
        spanError.innerHTML = "Hubo un error: " + res.status + " " + await res.text();
    } else {
        console.log('Cat pic uploaded');
        const data = await res.json();
        saveFavCat(data.id);
    }
}

loadFavCats();

//Sigue: 
// 1. Mejorar el diseño para que quede un grid parejo: Done
// 2. Preview de la miniatura de la foto a subir
