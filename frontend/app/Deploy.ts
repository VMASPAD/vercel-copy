"use server";
import { cookies } from "next/headers";


async function Deploy(urlGit:string, userGit:string, nameArchive:string, command: string, port: number, idMail: string) {
      
  const createRepository = await fetch("http://localhost:1000/createRepository", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "urlGit":`${urlGit}`,
      "userGit":`${userGit}`,
      "nameArchive":`${nameArchive}`,
      "command":`${command}`,
      "port":`${port}`,
      "idMail":`${idMail}`,
    },
    body: JSON.stringify({ urlGit, userGit, nameArchive, command, port,idMail }),
  });
  const starts = await createRepository.json();
  console.log(starts);

  const response = await fetch("http://localhost:1000/deployGit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urlGit, userGit, nameArchive, command, port }),
    });
    const result = await response.json();
    console.log(result);

    cookies().set("urlGit", urlGit);
    cookies().set("nameArchive", nameArchive);
    cookies().set("host", port.toString());


    return {result, starts}

  }
export {Deploy}