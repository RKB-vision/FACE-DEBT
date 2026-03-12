
const MODEL_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

    // <!-- WE ALSO HAVE TO LEARN HOW TO GET RAW CDN FILE FROM GITHUB LIKE WE USE HERE -->

async function loadModels() {
try{
await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
console.log("Models loaded successfully -Frontend")
document.getElementById("loading").style.display="none"
}catch(err){
    console.log("Failed to load models -Frontend",err)
}
}

loadModels();

const cam_st=document.querySelector("#start-camera")
const capt=document.querySelector("#capture")
const camera=document.querySelector("#camera")
const canva=document.querySelector("#face-snap")
const face_tr=document.querySelector("#face-add")

const user=document.querySelector("#username")
const debt=document.querySelector("#debt-amount")
let stream=null

cam_st.addEventListener("click",async()=>{
    try{
    canva.style.display="none"
    camera.style.display="block"
    stream=await navigator.mediaDevices.getUserMedia({video:true})
    camera.srcObject=stream

    capt.disabled=false
    cam_st.disabled=true
    }
    catch(err){
        alert("Error Kindly first allow the permision for the video!",err)
    }
})

capt.addEventListener("click",()=>{
    const ctx=canva.getContext("2d")
    canva.width=camera.videoWidth
    canva.height=camera.videoHeight
    
    ctx.drawImage(camera,0,0)

    camera.style.display="none"
    canva.style.display="block"
    stream.getTracks().forEach(track => track.stop())
    capt.disabled=true
    cam_st.disabled=false
}
)


face_tr.addEventListener("click",async()=>{

    if(!user.value){
    alert("Username must be filled")
    return;
    }
    if(!debt.value){
    alert("Debt must  must be filled")
    return;
    }
    if(canva.width==0){
    alert("Capture the photo first")
    return;
    }

    const id= Date.now()

    const detection = await faceapi.detectSingleFace(canva).withFaceLandmarks().withFaceDescriptor()

    if(!detection){
        alert("No face detected in the image!!!")
        return
    }

    const userData={user:user.value,
        debt:debt.value,
        id,
        face_arr:detection.descriptor
    }   
    
    localStorage.setItem(`person${id}`,JSON.stringify(userData))

    user.value="";
    debt.value="";
    
})