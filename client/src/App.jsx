import { useState } from "react";
import SignUp from "./SignUp.jsx"
import Chat from "./Chat.jsx"
import SignIn from "./SignIn.jsx"

export default function App() {
    const [page, setPage] = useState("signUp")
    const [userEmail, setUserEmail] = useState("")

    return (
        <>
            {page === "signUp" && <SignUp setUserEmail={setUserEmail} setPage={setPage}/>}
            {page === "signIn" && <SignIn setUserEmail={setUserEmail} setPage={setPage}/>}
            {page === "chats" && <Chat userEmail={userEmail} setPage={setPage}/>}
        </>
    )
}