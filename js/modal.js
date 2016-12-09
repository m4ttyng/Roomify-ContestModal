"use strict";
//************ GLOBAL VARIABLES *************//
let oneFileBool = true;
let roomsData;
//init some global variables to hold DOM elements
let roomList, featuresList, uploadList, nextButton, backButton, errorText,
    contestTitle, contestDesc, contestLength = 0, contestPrize;

//dimensions element variables
let unitSelected, widthMeters, heightMeters, lengthMeters, widthFeet, widthInches, lengthFeet, lengthInches, heightFeet, heightInches;
//hold final dimensions
let roomWidth, roomLength, roomHeight;

//init an array to hold all modal windows and prog bar li
let modalArray = new Array();
let progArray = new Array();

//init some global counter variables
let currentStep, currentRoom;

//init the variable that will hold an array of all room objects
let roomSelections = [];

//******************************************//


//**** Init the create contest wizard******//

function modalInit(){
    
    currentStep = 1;
    currentRoom = 0;
    roomSelections = [];
    
    uploadList = document.getElementById('uploadingQueue');
    roomList = document.getElementById("roomList");
    uploadList.innerHTML = "";
    roomList.innerHTML = "";
    
    featuresList = document.getElementById("features");
    backButton = document.getElementById("backBtn");
    nextButton = document.getElementById("nextBtn");
    nextButton.innerHTML = "Next";
    nextButton.removeAttribute("data-dismiss");
    
    widthMeters = document.getElementById("widthInput");
    heightMeters = document.getElementById("heightInput");
    lengthMeters = document.getElementById("lengthInput");
    widthFeet = document.getElementById("widthFin");
    widthInches = document.getElementById("widthIin");
    lengthFeet = document.getElementById("lengthFin");
    lengthInches = document.getElementById("lengthIin");
    heightFeet = document.getElementById("heightFin");
    heightInches = document.getElementById("heightIin");
    
    contestTitle = document.getElementById("titleInput");
    contestDesc = document.getElementById("descInput");
    contestPrize = document.getElementById("prizeSlider");
    errorText = document.getElementById("modalError");
    
    modalArray[0] = document.getElementById("step1");
    modalArray[1] = document.getElementById("step2");
    modalArray[2] = document.getElementById("step3");
    modalArray[3] = document.getElementById("step4");
    
    progArray = document.querySelectorAll("ul.progress-indicator>li");
    for (let i=1; i < progArray.length; i++){
        progArray[i].className = "";   
    }
    
    roomList.addEventListener("click", handleRoomClick);
    featuresList.addEventListener("click", handleFeatureClick);
    
    
    //TODO clean up these to listeners to one function
    $('#lengthMenu a').on('click', function(){   
        contestLength = $(this).data("value");
        $('#lengthBtn').html($(this).html());    
    });
    
     $('#metricMenu a').on('click', function(){   
        unitSelected = $(this).data("name") ;
         console.log(this);
         
        if (unitSelected == "Feet"){
            document.querySelector("#unitFeet").classList.remove("hidden");
            document.querySelector("#unitMeters").classList.add("hidden");
        }else{
            document.querySelector("#unitMeters").classList.remove("hidden");
            document.querySelector("#unitFeet").classList.add("hidden");
        }
         
          $('#metricBtn').html($(this).html()); 
    });
    
    dataRequest("api/roomInfo.php", null, updateRoomsModal);
 
}

//******************************************//


//****** Handling modal view changes ********//

function backClick(){
    
    
    switch (currentStep){
        case 2:
            currentStep--;
            backButton.classList.add("hidden");
            switchModalView(0);
            break; 
            
        case 3:
            currentStep--;
            switchModalView(1);
            break;
            
        case 4:
            currentStep--;
            switchModalView(2);
            nextButton.innerHTML = "Next";
            break;
            
        default:
            break;
    }
    
    progArray[currentStep].classList.remove("completed");
}

function nextClick(){
    
    let nextState = false;
    let errorMsg = "";
    
    switch (currentStep){
        case 1:
                
            for (let i=0; i < roomList.children.length; i++){
                if ( roomList.children[i].classList.contains("selected")){
                    nextState = true;
                    break;
                }
            } 
            
            if (!nextState) errorMsg = "Select at least one room.";
            break;
              
            
        case 2:
            
            for (let i=0; i < featuresList.children.length; i++){
                    
                    if (featuresList.children[i].classList.contains("selected")){
                        nextState = true;
                        break;
                    }
            } 
            
            if (nextState){
                if (unitSelected == "Feet"){

                    if (widthFeet.value.length > 0 && lengthFeet.value.length > 0 && heightFeet.value.length > 0){
                        
                        if (!isNaN(widthFeet.value) || !isNaN(widthInches.value) || !isNaN(lengthFeet.value) ||
                            !isNaN(lengthInches.value) || !isNaN(heightFeet.value) || !isNaN(heightInches.value)){

                                roomWidth = (widthFeet.value * 0.3048) + (widthInches.value * 0.0254);
                                roomLength = (lengthFeet.value * 0.3048) + (lengthInches.value * 0.0254);
                                roomHeight = (heightFeet.value * 0.3048) + (heightInches.value * 0.0254);
                            
                                console.log(roomWidth);
                                console.log(roomHeight);
                                console.log(roomLength);

                         }else{
                          nextState = false;   
                         }
                    }else{
                     nextState = false;   
                    }

                } else {
                    
                    if (widthMeters.value.length > 0 && lengthMeters.value.length > 0 && heightMeters.value.length > 0){
                    if (!isNaN(widthMeters.value) || !isNaN(lengthMeters.value) || !isNaN(heightMeters.value)){
                        
                        roomWidth = widthMeters.value;
                        roomLength = lengthMeters.value;
                        roomHeight = heightMeters.value;  
                        
                    }else{
                      nextState = false;   
                    }
                }else{
                     nextState = false;   
                    }
                }
                             
            }
                
            if (!nextState) errorMsg = "Select at least one feature and provide valid dimensions.";
            break;
                
        case 3:
            
            if (roomSelections[currentRoom].roomFiles.length > 0) nextState = true;
            else errorMsg = "Please upload at least one image.";
            break;
            
        case 4:

            if ( contestTitle.value.length == 0 ) errorMsg = "Please enter a contest title.";
            else if ( contestDesc.value.length == 0 ) errorMsg = "Please enter a contest description.";
            else if ( contestLength == 0) errorMsg = "Please enter a contest length.";
            else nextState = true;
            
            break;
            
        default:
            break;
    }
    
    if (nextState) nextStep();
    else errorText.innerHTML = errorMsg;
    
}

function nextStep(){
    
    switch (currentStep){
        case 1:
            progArray[currentStep].className = "completed";
            currentStep++;
            saveRoomSelections();
            backButton.classList.remove("hidden");
            switchModalView(1);
            break;
        case 2:
            progArray[currentStep].className = "completed";
            currentStep++;
            saveRoomFeatures();
            imagesModal();
            switchModalView(2);
            break;
        case 3:  
            
            if ((currentRoom + 1) < roomSelections.length){
                currentRoom++;
                currentStep = 2;
                updateFeaturesModal();
                switchModalView(1);
            }else{
                progArray[currentStep].className = "completed";
                nextButton.innerHTML = "Done";
                switchModalView(3);
                currentStep++;
                
                console.log(roomSelections);
            }
            
            break;
        case 4:
            
            finalizeContest();
            break;
    }
    
}

function switchModalView(showMe){
                
    for (let i=0; i < modalArray.length; i++){
        modalArray[i].classList.add("hidden");
    }
    
    errorText.innerHTML = "";
    modalArray[showMe].classList.remove("hidden");
}

//******************************************//

function updateRoomsModal(response){
    
    roomsData = response;
    
    console.log(roomsData);
    
     for (let i=0; i < roomsData.length; i++){
        
             
            let li = document.createElement("li");
            li.innerHTML = roomsData[i].roomType;
            let check = document.createElement("span");
            check.className = "checkMark fa fa-check pull-right";
            li.appendChild(check);

            roomList.appendChild(li);
        
    }    

     switchModalView(0);     
}

function handleFeatureClick(ev){
    
    if (ev.target.classList.contains("selected")){
            ev.target.classList.remove("selected");
            ev.target.lastChild.classList.remove("checked");
        }else {
            ev.target.classList.add("selected");  
            ev.target.lastChild.classList.add("checked");
    }
    
}

function handleRoomClick(ev){

    //this if statent limits one room selection. remove everthing but the 'else' code to return to multiple room selection 
        for (let i=0; i < roomList.children.length; i++){
            if (roomList.children[i].classList.contains("selected")){
                roomList.children[i].classList.remove("selected");
                ev.target.lastChild.classList.remove("checked");
            }
        }
        
        ev.target.classList.add("selected");
        ev.target.lastChild.classList.add("checked");
}

function saveRoomSelections(){
    
    roomSelections = [];
    
    for (let i=0; i < roomList.children.length; i++){
        if ( roomList.children[i].classList.contains("selected")){
            roomSelections.push({
                
                roomType: roomList.children[i].textContent,
                roomFeatures: [],
                roomFiles: [],
                roomSize: {width:0,height:0,length:0},
                roomDesc: ""
            });
        }
    }
    updateFeaturesModal();
}

function saveRoomFeatures(){
    
    for (let i=0; i < featuresList.children.length; i++){
        
        if ( featuresList.children[i].classList.contains("selected")){
            roomSelections[currentRoom].roomFeatures.push(featuresList.children[i].innerHTML);
        }
    }
    
    roomSelections[currentRoom].roomSize.height = roomHeight
    roomSelections[currentRoom].roomSize.width = roomWidth;
    roomSelections[currentRoom].roomSize.length = roomLength;
    
}

function updateFeaturesModal(){

    let h5 = document.getElementById("modalLabel");
    h5.innerHTML = roomSelections[currentRoom].roomType + " Features";
    featuresList.innerHTML = "";
    widthMeters.value = "";
    heightMeters.value = "";
    lengthMeters.value = "";
    widthFeet.value = "";
    widthInches.value = "";
    lengthFeet.value = "";
    lengthInches.value = "";
    heightFeet.value = "";
    heightInches.value = "";
   
    
    for (let i=0; i < roomsData.length; i++){
        
        if (roomSelections[currentRoom].roomType == roomsData[i].roomType){
            
            for (let x=0; x < roomsData[i].features.length; x++){
             
                    let li = document.createElement("li");
                    li.innerHTML = roomsData[i].features[x];
                    let check = document.createElement("span");
                    check.className = "checkMark fa fa-check pull-right";
                    
                    li.appendChild(check);
                    featuresList.appendChild(li);
            }
        }  
    }  
    
    let dxInputs = document.querySelectorAll(".dxIn");
    for (let i=0;i<dxInputs.length;i++){
        
        dxInputs[i].addEventListener("keyup", showMetricLabel);
    }
}

function imagesModal(){
    
    let form = document.getElementById('uploadForm');
    let dropZone = document.getElementById('dropZone');
    let header = document.getElementById('imgLabel');
    let fileCount = 0;
    
    header.innerHTML = roomSelections[currentRoom].roomType + " Images";

    let startUpload = function(files) {
        
        createFileItem(files[0].name);
        console.log(files);
        
        let data = new FormData();   
        data.append("SelectedFile", files[0]);
        
        dataRequest("api/fileUpload.php", data, function(response){
            
             if (response.code == 0){
                 
                //add file to project files object
                roomSelections[currentRoom].roomFiles.push({
                    name: response.fileName,
                    originalName: files[0].name,
                    type: files[0].type,
                    size: files[0].size,
                    caption: ""
                });
                 
                 console.log(uploadList.childElementCount);
            
                 let targetDiv = uploadList.querySelector('[data-name="'+files[0].name+'"');
                 
                 setTimeout(function(){
                    let progB = targetDiv.querySelector("p.progBar");
                    progB.classList.add("success");
                 }, 2000);
                 
                 setTimeout(function(){
                        let span = targetDiv.querySelector(".hidden");
                        span.classList.remove("hidden");
                        let thumb = targetDiv.querySelector(".myThumb");
                        thumb.src = "upload/" + response.fileName;
                        let w = $('.myThumb').last().width();
                        $('.myThumb').css({'height': w +'px'});
                     
                     
                 },4500);
                 
                 console.log(roomSelections);
                 
             }else{
                 console.log(response.message);
                 
                 //TODO file type not supported
             }
        });
    
    }
    
    form.addEventListener('submit', function(e) {
        let uploadFiles = document.getElementById('uploadFiles').files;
        e.preventDefault()

        if (uploadFiles.length > 0 && oneFileBool){
            oneFileBool = false;
            console.log("UPLOAD NOW");
            startUpload(uploadFiles);
        }
    
    });

    dropZone.ondrop = function(e) {
        e.preventDefault();
        this.className = 'upload-drop-zone';

        startUpload(e.dataTransfer.files)
    }

    dropZone.ondragover = function() {
        this.className = 'upload-drop-zone drop';
        return false;
    }

    dropZone.ondragleave = function() {
        this.className = 'upload-drop-zone';
        return false;
    }

}

function createFileItem(fileName){
    
    let wrapper = document.createElement("div");
    let thumbDiv = document.createElement("div");
    let mainDiv = document.createElement("div");
    let breakDiv = document.createElement("div");
    let thumbImg = document.createElement("img");
    let nameH6 = document.createElement("h6");
    let closeBtn = document.createElement("button");
    let progP = document.createElement("p");
    let capSpan  = document.createElement("span");
    let successSpan = document.createElement("span");
    
    wrapper.setAttribute("class","nopadding");
    wrapper.setAttribute("data-name",fileName);
    thumbDiv.setAttribute("class","col-sm-3 nopadding");
    mainDiv.setAttribute("class","col-sm-9");
    breakDiv.setAttribute("class","lineBreak col-sm-12");
    
    thumbImg.setAttribute("class","img-thumbnail myThumb nopadding");
    thumbImg.src = "img/imgPlaceHolder.png";
    
    nameH6.setAttribute("class","nopadding");
    nameH6.innerHTML = truncate(fileName);
    
    
    closeBtn.setAttribute("type","button");
    closeBtn.setAttribute("class","close close-sm");
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", function(ev){ deleteImage(fileName, ev.target); });
                             
    progP.setAttribute("class","progBar");
    capSpan.setAttribute("class","addCaption pull-left");
    capSpan.setAttribute("data-toggle","modal");
    capSpan.setAttribute("data-target","#captionModal");
  
    capSpan.innerHTML = "Add caption";
    successSpan.setAttribute("class","pull-right hidden");
    successSpan.innerHTML = ("Completed");
    
    nameH6.appendChild(closeBtn);
    thumbDiv.appendChild(thumbImg);
    mainDiv.appendChild(nameH6);
    mainDiv.appendChild(progP);
    mainDiv.appendChild(capSpan);
    mainDiv.appendChild(successSpan);
    wrapper.appendChild(thumbDiv);
    wrapper.appendChild(mainDiv);
    wrapper.appendChild(breakDiv);
    
    uploadList.appendChild(wrapper);
    
    setTimeout(function(){ progP.classList.add("loading"); }, 500);
        
    
}

function finalizeContest(){
    
    let project = new FormData();
    
    project.append("title", contestTitle.value);
    project.append("desc", contestDesc.value);
    project.append("length", contestLength); //total weeks
    project.append("prize", contestPrize.value);
    
    project.append("roomType", roomSelections[0].roomType);
    project.append("roomWidth", roomSelections[0].roomSize.width);
    project.append("roomLength", roomSelections[0].roomSize.length);
    project.append("roomHeight", roomSelections[0].roomSize.height);
    
    project.append("roomFeatures", JSON.stringify(roomSelections[0].roomFeatures));
    project.append("roomFiles", JSON.stringify(roomSelections[0].roomFiles));
    
    console.log(roomSelections[0]);
    
    dataRequest("api/contestUpload.php", project, function(res){
        
        console.log(res);
        console.log("project created success");
    });
    
    nextButton.setAttribute("data-dismiss","modal");
    
    
}

function dataRequest(url, params, callback){
    
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    
    
    xhr.addEventListener("load", function(){
       callback(JSON.parse(xhr.responseText));
    });
    
    xhr.send(params);
}

function truncate(string){
    if (string.length > 15)
      return string.substring(0,15)+'...';
    else
      return string;
};

function subBtnActivate(){
    
    oneFileBool = true;
    document.getElementById("uploadSubmit").click();
}

function showPrizeValue(value){
    
    document.getElementById("prizeVal").innerHTML= "$" + value;

}

function deleteImage(file, target){
    var r = confirm("Are you sure you want to delete this Image?")
    
    if(r == true)
    {
        let data = new FormData();
        data.append("file",file);
       dataRequest("api/deleteUpload.php", data, function(res){
           
           console.log(res.message);
           uploadList.removeChild(target.parentElement.parentElement.parentElement);
           
           for (let i=0; i < roomSelections[currentRoom].roomFiles.length; i++){
               
               if (roomSelections[currentRoom].roomFiles[i].originalName == file){
                   
                   roomSelections[currentRoom].roomFiles.splice(i,1);
               }
           }
       });
        
    }
}

function showMetricLabel(ev){
    
    ev.preventDefault();
    let label = document.querySelectorAll(".dxInLabel");
    
    if (this.value){
        label[this.getAttribute('data-value')].classList.add("revealMe");
    } else {
        label[this.getAttribute('data-value')].classList.remove("revealMe");
    }

}

function clearModalData(){
    
    
    
}


//var isAdvancedUpload = function() {
//  var div = document.createElement('div');
//  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
//}();