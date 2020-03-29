const modalOverlay = document.querySelector('.modal-overlay');
const cards = document.querySelectorAll('.card');

for(let card of cards){
    card.addEventListener("click", function(){
        const ImgId      = card.getAttribute("id");
        const titleId    = card.querySelector('h2').innerText
        const subtitleId = card.querySelector('h3').innerText
        modalOverlay.querySelector('img').src = `imgs/${ImgId}.png`;
        modalOverlay.querySelector('h2').innerText = titleId;
        modalOverlay.querySelector('h3').innerText = subtitleId;
        modalOverlay.classList.add('active');
    });
}

document.querySelector('.close-modal').addEventListener("click", function(){
    modalOverlay.classList.remove('active');
    modalOverlay.querySelector('img').src = '';
});