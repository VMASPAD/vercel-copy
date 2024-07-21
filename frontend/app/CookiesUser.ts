"use server";
import { cookies } from "next/headers";

interface DataUser {
  email: string;
  id: string;
}
const cookieStore = cookies();

async function setCookiesUserData(dataUser: DataUser) {
  cookieStore.set("email", dataUser.email);
  cookieStore.set("idMail", dataUser.id);
}
async function changeCookiesUserData(dataUser: DataUser) {
  cookieStore.set("email", dataUser.email);
  cookieStore.set("idMail", dataUser.id);
}
async function deleteCookiesUserData() {
  cookieStore.delete("email");
  cookieStore.delete("idMail");
}
async function getDataUser() {
  const email = cookieStore.get("email")?.value;
  const idmail = cookieStore.get("idMail")?.value;
  const data = fetch("http://localhost:1000/getDataUser", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      emaildata: `${email}`,
      idmail: `${idmail}`,
    },
  })
    .then((data) => {
      console.log("Datos recibidos");
      return data.json();
    })
    .catch((error) => {
      console.error("¡Hubo un problema con la solicitud!", error);
    });
  return data;
}

async function GetDataEmailCookie() {
  const email = cookieStore.get("email")?.value;
  const idMail = cookieStore.get("idMail")?.value;
  const data = fetch("http://localhost:1000/getDataRepository", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      email: `${email}`,
      idmail: `${idMail}`,
    },
  })
    .then((data) => {
      console.log("Datos recibidos:", data);

      return data.json();
    })
    .catch((error) => {
      console.error("¡Hubo un problema con la solicitud!", error);
    });
  return data;
}
export {
  getDataUser,
  GetDataEmailCookie,
  setCookiesUserData,
  changeCookiesUserData,
  deleteCookiesUserData,
};
