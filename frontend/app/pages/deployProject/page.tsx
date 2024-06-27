"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Deploy } from '../../Deploy';
import { GetUserData } from "../../GetUserData";
import { useDeployToast } from "../../Toast";
import { useRouter } from "next/navigation";

function DeployProject() {
  const [wsMessage, setWsMessage] = useState("");
  const toastDeploy = useDeployToast();
  const router = useRouter();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      console.log('Message from server ', event.data);
      setWsMessage(event.data);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      ws.close();
    };
  }, []);

  function extractGitHubInfo(url: string) {
    const regex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(regex);
    if (!match) {
      return null;
    }
    return {
      profile: match[1],
      repository: match[2]
    };
  }

  async function deployData() {
    const getTempEmail = localStorage.getItem("emailData");
    const urlGit = (document.getElementById("urlGit") as HTMLInputElement).value;
    const command = (document.getElementById("command") as HTMLInputElement).value;
    const port = parseInt((document.getElementById("port") as HTMLInputElement).value)
    const info = extractGitHubInfo(urlGit);
    const userData = await GetUserData(getTempEmail);
    const deployResult = await Deploy(urlGit, info?.profile ,info?.repository, command, port, getTempEmail);
    if (info) {
      toastDeploy({ title: { profile: info.profile, repository: info.repository }, description: info.repository, command: command,port:port});
      if (deployResult.message) {
        toastDeploy({ title: { profile: info.profile, repository: info.repository }, description: "Repositorio clonado exitosamente" });
      } else if (deployResult.error) {
        toastDeploy({ title: { profile: info.profile, repository: info.repository }, description: `Error: ${deployResult.error}` });
      }
    }
    console.log(userData);
  }
  function redirectDashboard(){
    
    router.push("/pages/dashboard");
  }

  return (
    <div className="flex flex-col justify-center h-screen items-center">
      <Card>
        <CardHeader>
          <CardTitle>Card Deploy</CardTitle>
          <CardDescription>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input placeholder="URL git" id="urlGit" />
          <Separator className="my-5" />
          <Input placeholder="command" id="command" />
          <Separator className="my-5" />
          <Input placeholder="port" id="port" type="number"/>
        </CardContent>
        <p></p>
        <CardFooter>
          <Button onClick={deployData}>Deploy</Button>
          <Button onClick={redirectDashboard}>Dashboard</Button>
        </CardFooter>
      </Card>
      <br />
      {wsMessage && <div>{wsMessage}</div>}
    </div>
  );
}

export default DeployProject;
