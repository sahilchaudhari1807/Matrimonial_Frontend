import { useState,useEffect } from "react";
import {useParams} from "react-router-dom";


function ProfileView(){
  const [user,setUser]=useState(null);
    const{id}=useParams();
    useEffect(() => {
   fetch(`http://localhost:8081/users/${id}`,{
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
   })
       .then(res => {
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }
    return res.json();
  })
  .then(data => setUser(data))
  .catch(err => console.error(err));
}, [id]);

   

   if (!user) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>{user.username}</h1>
      <p>Age: {user.age}</p>
      <p>City: {user.city}</p>
      <p>{user.bio}</p>
    </div>
  );
}
export default ProfileView;