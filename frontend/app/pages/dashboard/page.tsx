"use client"
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GetDataEmailCookie, getDataUser } from "../../cookies";
import { Button } from "@/components/ui/button";

interface DataUserGET{
  _id: string
  email: string
  pass: string
  id: string
}
interface RepositoryStructure{
  _id: string
  urlGit: string
  nameArchive: string
  port: string,
  userGit: string
  command: string
}
function Dashboard() {
const [dataUser, setDataUser] = useState<DataUserGET>()
const [dataRepository, setDataRepository] = useState<RepositoryStructure>()

  async function Data() {
    const dataAll = await getDataUser()
    const dataRepository = await GetDataEmailCookie()
    setDataUser(dataAll)
    setDataRepository(dataRepository)
    console.log(dataRepository)
  }
  
  useEffect(() => {
    Data()
  }, [])

  async function startProyect(userGit,nameArchive,command,port) {
    const response = await fetch("http://localhost:1000/startUserProyect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userGit, nameArchive, command, port })
    });

    const result = await response.json();
    console.log(result)
  }
  return (
    <div className="flex flex-col justify-center items-center mt-10">
      <nav className="grid grid-cols-2 justify-items-center w-7/12">
        <p>Email: {dataUser?.email}</p>
        <p>Id: {dataUser?.id}</p>
      </nav>
      <section className="flex flex-grow justify-center h-screen items-center gap-5">
      {dataRepository?.map((repo: RepositoryStructure) => (
          <Card key={repo._id}>
            <CardHeader>
              <CardTitle>{repo.nameArchive}</CardTitle>
              <CardDescription>{repo.userGit}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => startProyect(repo.userGit, repo.nameArchive,repo.command, repo.port)}>Run: {repo.nameArchive}</Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}

export default Dashboard;
