import { useState } from "react";
import { signIn } from "aws-amplify/auth"

export default function SignIn({setPage}) {
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")

    async function handleSubmit(event) {
        event.preventDefault()
        const { nextStep } = await signIn({
            username: email,
            password: pass
        })
        if (nextStep.signInStep === "DONE") {
            console.log("signed in")
            setPage("chats")
        }
        event.target.reset()
    }

    return (
        <>
          <form onSubmit={handleSubmit}>
            <input type="text" onChange={(event)=>setEmail(event.target.value)}/>
            <input type="text" onChange={(event)=>setPass(event.target.value)}/>
            <button>Sign In</button>
          </form>
          <button onClick={()=>{setPage("signUp")}}>SIGN UP</button>
        </>
        
    )
}