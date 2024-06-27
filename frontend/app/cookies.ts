"use server";
import { cookies } from "next/headers";

async function getDataUser(){
    const cookieStore = cookies();
    const userId = cookieStore.get("email")?.value;
    console.log(userId)
    const data = fetch("http://localhost:1000/getUserData", {
      method: "GET",
      headers:{
        "Content-Type": "application/json",
        "emaildata": `${userId}`
      }
    })
  .then(data => {
    console.log('Datos recibidos:', data);
    
    return data.json()
  })
  .catch(error => {
    console.error('¡Hubo un problema con la solicitud!', error);
  });
  return data
}

async function setEmailCookie(email:any) {
    const cookieStore = cookies();
    console.log(email)
    cookies().set("email", email);
    const urlGit = cookieStore.get("urlGit")?.value;
    const nameArchive = cookieStore.get("nameArchive")?.value;
    const host = cookieStore.get("host")?.value;
}

async function GetDataEmailCookie() {
  const cookieStore = cookies();
  const urlGit = cookieStore.get("urlGit")?.value;
  const nameArchive = cookieStore.get("nameArchive")?.value;
  const host = cookieStore.get("host")?.value;
  const idMail = cookieStore.get("email")?.value
  const data = fetch("http://localhost:1000/getDataRepository", {
    method: "GET",
    headers:{
      "Content-Type": "application/json",
      "idMail": `${idMail}`
    },
  })
.then(data => {
  console.log('Datos recibidos:', data);
  
  return data.json()
})
.catch(error => {
  console.error('¡Hubo un problema con la solicitud!', error);
});
return data
  
}
export {getDataUser, setEmailCookie, GetDataEmailCookie}