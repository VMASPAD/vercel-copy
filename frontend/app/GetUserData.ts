
async function GetUserData(email : string) {
    const response = await fetch("http://localhost:1000/getUserData", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        emaildata: `${email}`
      },
    });
    const result = await response.json();
    console.log(result);
    return result
  }
export {GetUserData}