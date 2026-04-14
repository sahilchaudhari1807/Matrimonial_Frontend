import {useParams} from "react-router-dom";

function ProfileView(){
    const{id}=useParams();

    const users=JSON.parse(localStorage.getItem("users")) || [];
     const user = users.find((u) => u.id === Number(id));

   if (!user) {
    return <h2>User not found</h2>;
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