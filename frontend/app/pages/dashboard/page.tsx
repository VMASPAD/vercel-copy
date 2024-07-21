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
import { deleteCookiesUserData, GetDataEmailCookie, getDataUser } from "../../CookiesUser";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface DataUserGET {
  _id: string;
  email: string;
  pass: string;
  id: string;
}

interface RepositoryStructure {
  _id: string;
  urlGit: string;
  namearchive: string;
  port: string;
  usergit: string;
  command: string;
}

function Dashboard() {
  const [dataUser, setDataUser] = useState<DataUserGET | null>(null);
  const [dataRepository, setDataRepository] = useState<RepositoryStructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const dataAll = await getDataUser();
        const dataRepo = await GetDataEmailCookie();
        setDataUser(dataAll);
        setDataRepository(Array.isArray(dataRepo) ? dataRepo : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  async function startProyect(usergit: string, namearchive: string, command: string, port: string) {
    const email = localStorage.getItem("emailData");
    try {
      const response = await fetch("http://localhost:1000/startUserProyect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usergit, namearchive, command, port, email }),
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error("Error starting project:", error);
    }
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  async function logOut(){
    console.log("logout")
    await deleteCookiesUserData()
    router.push("/");
  }
  return (
    <div className="flex flex-col justify-center items-center mt-10">
      <nav className="grid grid-cols-4 justify-items-center w-7/12">
        <p>Email: {dataUser?.email}</p>
        <p>Id: {dataUser?.id}</p>
        <a href="./deployProject">New Deploy</a>
        <Button onClick={logOut}>Log out</Button>
      </nav>
      <section className="flex flex-grow justify-center h-screen items-center gap-5">
        {dataRepository.length === 0 ? (
          <p>No repository</p>
        ) : (
          dataRepository.map((repo) => (
            <Card key={repo._id}>
              <CardHeader>
                <CardTitle>{repo.namearchive}</CardTitle>
                <CardDescription>{repo.usergit}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => startProyect(repo.usergit, repo.namearchive, repo.command, repo.port)}>
                  Run: {repo.namearchive}
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}

export default Dashboard;