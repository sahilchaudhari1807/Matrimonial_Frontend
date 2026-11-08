export const markMessagesAsDelivered =async(messageId)=>{
   // console.log("markMessagesAsDelivered()", messageId);

    try {

        await fetch(`http://localhost:8081/messages/delivered/${messageId}`, {
    method: "PUT",
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    }
});

    } catch (error) {

        console.log(
            "error updating Delivered status",
            error
        );
    }

}