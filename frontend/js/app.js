
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
let allPeople = JSON.parse(localStorage.getItem("allPeople") || "[]")
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
    allPeople.push(`person${id}`)
    localStorage.setItem("allPeople",JSON.stringify(allPeople))

    user.value="";
    debt.value="";
    
})

//FOR SCANNING
const scanBtn=document.querySelector("#btn-scan")
const scanner=document.querySelector("#scanner")
const scan_result=document.querySelector("#result")
let isCameraOn = false

scanBtn.addEventListener("click",async()=>{
if(!isCameraOn){
     stream=await navigator.mediaDevices.getUserMedia({video:true})
    scanner.srcObject=stream
    isCameraOn=true
}
else{
    const detection = await faceapi.detectSingleFace(scanner).withFaceLandmarks().withFaceDescriptor()
    if(!detection){
        alert("No face detected")
        return
    }
    else{

        const loadedPeople = []

        allPeople.forEach((key)=>{
            loadedPeople.push(JSON.parse(localStorage.getItem(key)))
        })
        const labeledDescriptors = []
        loadedPeople.forEach(person=>{
            const descriptor = new Float32Array(Object.values(person.face_arr))
            labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(person.id, [descriptor]))
        })
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors)
        const match = faceMatcher.findBestMatch(detection.descriptor)
        console.log(match)

        if(match.label==="unknown"){
            scan_result.innerHTML=`<h1>Person not found in records</h1>`
            return
        }

        const matchedPerson=loadedPeople.find(person=>person.id===Number(match.label))

        scan_result.innerHTML=`<h1>${matchedPerson.user} owes you ₹ ${matchedPerson.debt}</h1>`
    }
}


})
