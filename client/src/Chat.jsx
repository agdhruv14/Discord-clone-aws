import { getCurrentUser, signOut } from "aws-amplify/auth"

try {
    const {userId} = await getCurrentUser()
} catch(error) {
    
}


export default function Chat({setPage, userEmail}) {
    
    async function signUserOut() {
        try {
            await getCurrentUser();
            await signOut();
            console.log("Signed out successfully");
          } catch (error) {
            console.log("No user was signed in, or already signed out:", error);
          }
        setPage("signUp")
    }

    return (
        <>
            <h1>You are signed in as {userId}!</h1>
            <button onClick={signUserOut}>SIGN OUT</button>
        </>
        
    )
}