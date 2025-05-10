import { Amplify } from "aws-amplify"
import { autoSignIn, confirmSignIn, signUp, confirmSignUp, signIn, getCurrentUser } from "aws-amplify/auth"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"


const socket = io("http://localhost:3000")

export default function SignUp({setPage}) {
  
  useEffect(()=>{
    async function checkUserSignedIn() {
      try {
        const user = await getCurrentUser()
        console.log(user)
        setPage("chats")
      } catch(error) {
      }
    }
    checkUserSignedIn()
  })

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userName, setUserName] = useState("")
  const [getCode, setGetCode] = useState(false)
  const [Otp, setOtp] = useState("")
  const [userID, setUserID] = useState("")
 
  async function handleSignUp(event) {
    event.preventDefault()
    const { userId, nextStep } = await signUp({
      username: email,
      password: password,
      options: {
        autoSignIn: { authFlowType: 'USER_AUTH' }
      }
    })
    setUserID(userId)

    if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
      setGetCode(true)
    }
    event.target.reset()
  }

  async function handleOtp(event) {
    event.preventDefault()
    
    const {nextStep: signUpConfirmation} = await confirmSignUp({
      username: email,
      confirmationCode : Otp
    })
    setGetCode(false)

    socket.emit("userData", userID, email, userName)
  
    if (signUpConfirmation.signUpStep === "COMPLETE_AUTO_SIGN_IN") {
      console.log("SUCCESSFULLY SIGNED UP")
      const { nextStep: finalStep } = await autoSignIn()

      if (finalStep.signInStep === "CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION") {
        const { nextStep : next } = await signIn({
            username: email,
            password: password
        })
        if (next.signInStep === "DONE") {
          console.log("signed in")
          setPage("chats")
        }
        else {
          setPage("signIn")
        }
      }
      if (finalStep.signInStep === "DONE") {
        console.log("SIGNED IN")
        setPage("chats")
      }
    }
    event.target.reset()
  }


  return (
    <>
    { !getCode ? (
    <>
    <form onSubmit={handleSignUp}>
      <input type="text" onChange={(event)=>{setEmail(event.target.value)}} placeholder="test@test.com"/>
      <input type="text" onChange={(event)=>{setUserName(event.target.value)}} placeholder="bob"/>
      <input type="password" id="password" onChange={(event)=>{setPassword(event.target.value)}} placeholder="pass..."/>
      <button> Sign Up</button>
      
    </form>
    <button onClick={()=>setPage("signIn")}>SIGN IN</button>
    </>
    ) : ( 
    <form onSubmit={handleOtp}>
      <input type="text" onChange={(event)=>{setOtp(event.target.value)}}/>
      <button> Submit </button>
    </form>
    )}
    </>
  )
}