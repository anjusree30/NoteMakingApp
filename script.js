function popup() {
    const popupContainer = document.createElement("div");
    popupContainer.innerHTML = `
    <div id="popupContainer">
    <h1> New Note</h1>
    <input type="text" id="note-title" placeholder="Enter your note title..." />
    <div id="titleErrorContainer"></div>
    <textarea id="note-text" placeholder="Enter your note content..."></textarea>
    <input type="file" id="note-image" accept="image/*" onchange="uploadImage()" style="margin-top: 10px;">
    <div id="imagePreviewContainer" style="margin-top: 10px;"></div>
    <div id="btn-container">
    <button id="submitBtn" onclick="createNote()">Create Note</button>
    <button id ="closeBtn" onclick="closePopup()">Close</button>
    
    </div>
    
    </div>
    
    
    
    `;
    document.body.appendChild(popupContainer);

}
function closePopup(){
    const popupContainer=document.getElementById("popupContainer");
    if(popupContainer){
        popupContainer.remove();
    }
}let uploadedImage = null; // Store uploaded image data
let imgPreview = null; // Reference to image preview element

function uploadImage() {
    const imageInput = document.getElementById("note-image");
    const file = imageInput.files[0]; // Get the selected file
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");

    // Clear the previous preview (if any)
    imagePreviewContainer.innerHTML = '';

    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            uploadedImage = event.target.result; // Store the image data

            // Create the image preview container
            const imgWrapper = document.createElement("div");
            imgWrapper.style.position = "relative";
            imgWrapper.style.display = "inline-block";
            imgWrapper.style.marginTop = "20px"; // Add some space above the image preview

            // Create the image preview element
            imgPreview = document.createElement("img");
            imgPreview.src = uploadedImage;
            imgPreview.style.maxWidth = "200px"; // Set max width for preview
            imgPreview.style.maxHeight = "200px"; // Set max height for preview
            imgPreview.style.display = "block"; // Ensure it's block level for margin

            // Create the "remove" icon (a '✖' symbol in this case)
            const removeIcon = document.createElement("span");
            removeIcon.innerHTML = "&#10006;"; // This is the '✖' symbol
            removeIcon.style.position = "absolute";
            removeIcon.style.top = "-30px"; // Position it above the image
            removeIcon.style.right = "0px"; // Align to the right of the image
            removeIcon.style.cursor = "pointer";
            removeIcon.style.color = "red";
            removeIcon.style.fontSize = "20px";
            removeIcon.style.fontWeight = "bold";

            // Handle image removal when the icon is clicked
            removeIcon.onclick = function () {
                uploadedImage = null; // Reset uploaded image
                imgWrapper.remove(); // Remove the image wrapper (which contains the preview and the icon)
                imageInput.value = ''; // Clear the file input
            };

            // Append the image and the remove icon to the image wrapper
            imgWrapper.appendChild(imgPreview);
            imgWrapper.appendChild(removeIcon);

            // Append the image wrapper to the container
            imagePreviewContainer.appendChild(imgWrapper);
        };

        reader.readAsDataURL(file); // Read the image file
    }
}


function createNote() {
    const popupContainer = document.getElementById("popupContainer");
    const noteTitle = document.getElementById("note-title").value;
    const noteText = document.getElementById("note-text").value;

    // Validate title and text
    if (noteTitle.trim() === '') {
        document.getElementById("titleErrorContainer").innerText = "Title is required.";
        return;
    } else {
        document.getElementById("titleErrorContainer").innerText = ""; // Clear any previous errors
    }

    if (noteText.trim() === '') {
        alert("Note content cannot be empty.");
        return;
    }

    const note = {
        id: new Date().getTime(),
        title: noteTitle,
        text: noteText,
        image: uploadedImage // Store the uploaded image data
    };

    const existingNotes = JSON.parse(localStorage.getItem('notes')) || [];
    existingNotes.push(note);
    localStorage.setItem('notes', JSON.stringify(existingNotes));

    // Clear fields and reset image preview
    document.getElementById('note-text').value = '';
    document.getElementById('note-title').value = '';
    document.getElementById('note-image').value = ''; // Clear file input
    uploadedImage = null; // Reset uploaded image

    if (imgPreview) {
        imgPreview.remove(); // Remove image preview after note creation
        imgPreview = null; // Reset preview variable
    }

    popupContainer.remove();
    displayNotes(); // Call a function to display notes
}
function searchNotes() {

    const searchInputElement = document.getElementById('searchInput');
    const searchInput = searchInputElement.value.toLowerCase(); // Get the input value and convert it to lowercase
    const notes = JSON.parse(localStorage.getItem('notes')) || []; // Get notes from localStorage

    // Check if searchInput is not empty before filtering
    const filteredNotes = notes.filter(note => 
        (note.title && note.title.toLowerCase().includes(searchInput)) || 
        (note.text && note.text.toLowerCase().includes(searchInput))
    );

    displayNotes(filteredNotes); // Call displayNotes with filtered notes
}

function displayNotes(filteredNotes = null) {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';  // Clear existing notes
    
    const notes = filteredNotes || JSON.parse(localStorage.getItem('notes')) || [];  // Retrieve notes from localStorage
    
    // Separate pinned and unpinned notes
    const pinnedNotes = notes.filter(note => note.pinned);
    const unpinnedNotes = notes.filter(note => !note.pinned);
    const createNoteItem = (note) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div id="titleWithPin" style="display: flex; justify-content: space-between; align-items: center;">
                <h3>${note.title}</h3>
                <button id="pinBtn" onclick="togglePin(${note.id})">
                    ${note.pinned ? '<i class="fa-solid fa-thumbtack" style="transform: rotate(180deg);"></i>' : '<i class="fa-solid fa-thumbtack"></i>'}
                </button>
            </div>
            <span>
                ${note.text} 
                ${note.image ? `<img src="${note.image}" alt="Note Image" style="width: 50px; height: 50px; display: block; margin-top: 5px;">` : ''}
            </span>
            <div id="noteBtns-container">
                <button id="editBtn" onclick="editNote(${note.id})"><i class="fa-solid fa-pen"></i></button>
                <button id="deleteBtn" onclick="deleteNote(${note.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        return listItem;  // Return the constructed list item
    };
    
    
    // Display pinned notes first
    pinnedNotes.forEach(note => {
        const listItem = createNoteItem(note);
       
        notesList.appendChild(listItem);  // Append pinned notes to the list
    });
    
    // Then display unpinned notes
    unpinnedNotes.forEach(note => {
        const listItem = createNoteItem(note);
       
        notesList.appendChild(listItem);
       
    });
}

function togglePin(noteId) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    
    // Find the note by its id and toggle its pinned status
    const updatedNotes = notes.map(note => {
        if (note.id === noteId) {
            note.pinned = !note.pinned;
        }
        return note;
    });
    
    // Save the updated notes back to localStorage
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
    
    // Re-display the notes
    displayNotes();
}

let uploadedEditImage = null; // Store the uploaded image for editing
let isImageRemoved = false;
function editNote(noteId) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const noteToEdit = notes.find(note => note.id == noteId);

    const noteText = noteToEdit ? noteToEdit.text : '';
    const noteTitle = noteToEdit ? noteToEdit.title : '';
    const noteImage = noteToEdit ? noteToEdit.image : null;

    const editingPopup = document.createElement("div");
    editingPopup.innerHTML = `
        <div id='editing-container' data-note-id="${noteId}">
            <h1>Edit Note</h1>
            <input type="text" id="note-title-edit" value="${noteTitle}" placeholder="Enter note title...">
            <textarea id="note-text-edit">${noteText}</textarea>
            <div id="cancelWithImage">
              ${noteImage ? `<i class="fas fa-times" onclick="removeImage()"></i>` : ''}
            ${noteImage ? `<img src="${noteImage}" alt="Note Image" id="existing-image" style="width: 50px; height: 50px;">` : ''}
           
             </div>
            <input type="file" id="note-image-edit" accept="image/*" onchange="uploadEditImage()">
            <div id="btn-container">
                <button id="submitBtn" onclick="updateNote(${noteId})">Done</button>
                <button id="closeBtn" onclick="closeEditPopup()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(editingPopup);
}function removeImage() {
    isImageRemoved = true;
    const imgPreview = document.getElementById("existing-image");
    if (imgPreview) {
        imgPreview.remove(); // Remove the image preview
        uploadedEditImage = null; // Clear the uploaded image variable
    }

    // Remove the cancel icon itself
    const closeIcon = document.querySelector("#cancelWithImage i");
    if (closeIcon) {
        closeIcon.remove();
    }
    const imageInput = document.getElementById("note-image-edit");
    if (imageInput) {
        imageInput.value = ""; // Reset the file input field to clear the chosen file
    }
}

function uploadEditImage() {
    const imageInput = document.getElementById("note-image-edit");
    const file = imageInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            uploadedEditImage = event.target.result; // Store the new uploaded image
            const imgPreview = document.getElementById("existing-image");
            const cancelIcon = document.querySelector("#cancelWithImage i");

            if (imgPreview) {
                imgPreview.src = uploadedEditImage; // Update existing image preview
            } else {
                // Create a new img element
                const newImgPreview = document.createElement("img");
                newImgPreview.src = uploadedEditImage;
                newImgPreview.id = "existing-image";
                newImgPreview.style.width = "100px";
                newImgPreview.style.height = "100px";
                document.getElementById("cancelWithImage").appendChild(newImgPreview);
            }

            // Show the cancel icon when an image is uploaded
            if (!cancelIcon) {
                const removeIcon = document.createElement("i");
                removeIcon.classList.add("fas", "fa-times");
                removeIcon.onclick = removeImage;
                document.getElementById("cancelWithImage").appendChild(removeIcon);
            }
        };

        reader.readAsDataURL(file); // Read the image file
    }
}

function closeEditPopup(){
    const editingPopup=document.getElementById("editing-container");
    if(editingPopup){
        editingPopup.remove();
    }
}function updateNote() {
    const editingPopup = document.getElementById("editing-container");
    const noteId = editingPopup.getAttribute('data-note-id');
    
    // Get the updated values
    const updatedTitle = document.getElementById("note-title-edit").value.trim();
    const updatedText = document.getElementById("note-text-edit").value.trim();

    // Validate that the note title and text are not empty
    if (updatedTitle !== '' && updatedText !== '') {
        let notes = JSON.parse(localStorage.getItem('notes')) || [];
        
        // Update the note's title, text, and image
        const updatedNotes = notes.map(note => {
            if (note.id == noteId) {
                return {
                    id: note.id,
                    title: updatedTitle,  // Updated title
                    text: updatedText,    // Updated text
                    image:isImageRemoved?null:( uploadedEditImage || note.image) // Keep original image if not updated
                };
            }
            return note;
        });
        
        // Store the updated notes back in localStorage
        localStorage.setItem('notes', JSON.stringify(updatedNotes));
        isImageRemoved=false;
        // Remove the editing popup and refresh the notes display
        editingPopup.remove();
        displayNotes();
    } else {
        alert("Both the note title and text cannot be empty.");
    }
}

function deleteNote(noteId){
    let notes=JSON.parse(localStorage.getItem('notes'))||[];
    notes=notes.filter(note=>note.id!==noteId);
    localStorage.setItem('notes',JSON.stringify(notes));
    displayNotes();
}
displayNotes();