const PhotosUpload = {
    input: "",
    preview: document.querySelector("#photos-preview"),
    uploadLimit: 5,
    files: [],
    handleFileInput(event) {
        const { files: fileList } = event.target

        PhotosUpload.input = event.target

        if (PhotosUpload.hasLimit(event)) return 

        Array.from(fileList).forEach( file => {
            PhotosUpload.files.push(file)

            const reader = new FileReader()

            reader.onload = () => {
                const image = new Image()
                image.src = String(reader.result)

                const div = PhotosUpload.getContainer(image)

                PhotosUpload.preview.appendChild(div)
            }

            reader.readAsDataURL(file)

        })

        PhotosUpload.input.files = PhotosUpload.getAllFiles()
    },
    hasLimit(event){
        const { uploadLimit, input, preview } = PhotosUpload
        const { files: fileList } = input

        if (fileList.length > uploadLimit) {
            alert(`Envie no máximo ${uploadLimit} fotos`)
            event.preventDefault()
            return true
        }

        const photosDiv = []
        preview.childNodes.forEach(item => {
            if (item.classList && item.classList.value == "photo") {
                photosDiv.push(item)
            }
        })

        const totalPhotos = fileList.length + photosDiv.length

        if (totalPhotos > uploadLimit) {
            alert("Você atingiu o limite máximo de fotos")
            event.preventDefault()
            return true            
        }

        return false
    },
    getAllFiles(){
        const dataTransfer = new ClipboardEvent("").clipboardData || new DataTransfer()

        PhotosUpload.files.forEach(file => dataTransfer.items.add(file))

        return dataTransfer.files

    },
    getContainer(image) {
        const div = document.createElement('div')
        div.classList.add('photo')

        div.onclick = PhotosUpload.removePhoto

        div.appendChild(image)

        div.appendChild(PhotosUpload.getRemoveButton())

        return div
    },
    getRemoveButton(){
        const button = document.createElement('i')
        button.classList.add('material-icons')
        button.innerHTML = "delete"
        return button
    },
    removePhoto(event){
        const photosDiv = event.target.parentNode
        
        const photosArray = Array.from(PhotosUpload.preview.children)
        const index = photosArray.indexOf(photosDiv)

        PhotosUpload.files.splice(index, 1)
        PhotosUpload.input.files = PhotosUpload.getAllFiles()

        photosDiv.remove()
    },
    removeOldPhoto(event) {
        const photosDiv = event.target.parentNode
        
        if (photosDiv.id){
            const removedFiles = document.querySelector('input[name="removed_files')
            if(removedFiles){
                removedFiles.value += `${photosDiv.id},`
            }
        }

        photosDiv.remove()

    }
}

const ImageGallery = {
    highlight: document.querySelector('.banner__img > img'),
    previews: document.querySelectorAll('gallery-preview img'),
    setImage(e){
        const { target } = e

        ImageGallery.previews.forEach(preview => preview.classList.remove('active'))
        target.classList.add('active')

        ImageGallery.highlight.src = target.src
    }
}

const Validate = {
    allFields(e){
        const items = document.querySelectorAll('.item input, .item selector, .item textarea');
        
        e.preventDefault()
        for(item of items){
            if (item.type == "file" && item.value == "") {
                const message = document.createElement('div')
                message.classList.add('message')
                message.classList.add('error')
                message.innerHTML = "Deve ser enviado pelo menos 1 imagem."
                document.querySelector('body').append(message)
                e.preventDefault()
            }
            else if (item.value == "") {
                const message = document.createElement('div')
                message.classList.add('message')
                message.classList.add('error')
                message.innerHTML = "Todos os campos são obrigatórios."
                document.querySelector('body').append(message)
                e.preventDefault()
            }
        }
    }
}