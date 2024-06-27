"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { setEmailCookie } from "./cookies";

interface Account {
  email: string;
  _id: string;
}

function generateId() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";

  for (let i = 0; i < 9; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Insertar los guiones en las posiciones deseadas
  const idWithDashes =
    id.slice(0, 3) + "-" + id.slice(3, 6) + "-" + id.slice(6, 9);

  return idWithDashes;
}

export default function Home() {
  const router = useRouter();

  async function Register() {
    const id = generateId();
    const email = (document.getElementById("mailRegister") as HTMLInputElement)
      ?.value;
    const pass = (document.getElementById("passRegister") as HTMLInputElement)
      ?.value;
    const emailData = localStorage.setItem("emailData", email);
    console.log(email, pass);
    const response = await fetch("http://localhost:1000/createUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, pass, id }),
    });

    const result = await response.json();
    if (response.status === 400) {
      console.log(result);
    } else {
      router.push("/pages/deployProject");
    }
  }
  async function Login() {
    const email = (document.getElementById("mailLogin") as HTMLInputElement)
      ?.value;
    const response = await fetch("http://localhost:1000/getUserData", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        emaildata: `${email}`,
      },
    });

    const result = await response.json();
    if (response.status === 400) {
      console.log(result);
    } else {
      setEmailCookie(email);
      router.push("/pages/dashboard");
    }
  }
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <Tabs
          defaultValue="account"
          className="w-[400px] flex flex-col justify-center"
        >
          <TabsList>
            <TabsTrigger value="login">login</TabsTrigger>
            <TabsTrigger value="registrer">registrer</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Card Login</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <Input placeholder="mail" id="mailLogin" type="email" />
                <Separator className="my-5" />
                <Input placeholder="pass" id="mailPass" type="password" />
              </CardContent>
              <CardFooter>
                <Button onClick={() => Login()}>Login</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="registrer">
            <Card>
              <CardHeader>
                <CardTitle>Card Register</CardTitle>
                <CardDescription>Card Description</CardDescription>
              </CardHeader>
              <CardContent>
                <Input placeholder="mail" id="mailRegister" type="email" />
                <Separator className="my-5" />
                <Input placeholder="pass" id="passRegister" type="password" />
              </CardContent>
              <CardFooter>
                <Button onClick={() => Register()}>Register</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
