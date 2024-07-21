"use server";
import { cookies } from "next/headers";

export interface DeployStructure {
  usergit: string;
  namearchive: string;
  port: number;
  email: string;
  idmail: string;
  command: string;
}

async function Deploy(urlGit: string, deploy: DeployStructure) {
  const idMail = cookies().get("idMail");
  const email = cookies().get("email");
  console.log(deploy);
  const createRepository = await fetch(
    "http://localhost:1000/createRepository",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        urlGit: `${urlGit}`,
        usergit: `${deploy.usergit}`,
        namearchive: `${deploy.namearchive}`,
        command: `${deploy.command}`,
        port: `${deploy.port}`,
        idmail: `${idMail?.value}`,
        email: `${email?.value}`,
      },
      body: JSON.stringify({
        urlGit,
        usergit: deploy.usergit,
        namearchive: deploy.namearchive,
        command: deploy.command,
        port: deploy.port,
        idMail,
      }),
    }
  );
  const starts = await createRepository.json();
  console.log(starts);

  const response = await fetch("http://localhost:1000/deployGit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email?.value,
      urlGit,
      usergit: deploy.usergit,
      namearchive: deploy.namearchive,
      command: deploy.command,
      port: deploy.port,
      idMail,
    }),
  });
  const result = await response.json();
  console.log(result);

  cookies().set("urlGit", urlGit);
  cookies().set("nameArchive", deploy.namearchive);
  cookies().set("host", deploy.port.toString());

  return { result, starts };
}
export { Deploy };
