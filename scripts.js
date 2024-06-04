document.getElementById('openGameButton').addEventListener('click', function() {
    window.location.href = 'Game.html'; 
});

document.getElementById('openDocumentation1').addEventListener('click', function() {
    window.open('DocPart1.pdf','_blank'; 
});


// Booking JS
document.addEventListener("DOMContentLoaded", function() {
    loadLodges();
    const checkinInput = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");
    
    // Set minimum check-in date to today
    const today = new Date().toISOString().split('T')[0];
    checkinInput.setAttribute('min', today);
    checkinInput.valueAsDate = new Date();
    
    // Set minimum check-out date to tomorrow
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    checkoutInput.setAttribute('min', tomorrow.toISOString().split('T')[0]);
    checkoutInput.valueAsDate = tomorrow;
    
    // Event listener to update check-out min date when check-in date changes
    checkinInput.addEventListener('change', setCheckoutMinDate);
});

function setCheckoutMinDate() {
    const checkinInput = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");
    
    let checkinDate = new Date(checkinInput.value);
    let minCheckoutDate = new Date(checkinDate);
    minCheckoutDate.setDate(minCheckoutDate.getDate() + 1);
    
    checkoutInput.setAttribute('min', minCheckoutDate.toISOString().split('T')[0]);
    
    // Ensure the check-out date is at least one day after the check-in date
    if (new Date(checkoutInput.value) <= checkinDate) {
        checkoutInput.valueAsDate = minCheckoutDate;
    }
}

function loadLodges() {
    fetch('lodges.xml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            const lodges = xmlDoc.getElementsByTagName('lodge');
            const map = document.getElementById('map');

            Array.from(lodges).forEach(lodge => {
                const id = lodge.getAttribute('id');
                const name = lodge.getElementsByTagName('name')[0].textContent;
                const capacity = lodge.getElementsByTagName('capacity')[0].textContent;
                const cost = lodge.getElementsByTagName('cost')[0].textContent;
                const status = lodge.getElementsByTagName('status')[0].textContent;
                const imagePath = lodge.getElementsByTagName('imagePath')[0].textContent;
                const x = lodge.getElementsByTagName('x')[0].textContent;
                const y = lodge.getElementsByTagName('y')[0].textContent;

                const lodgeDiv = document.createElement('div');
                lodgeDiv.className = 'lodge ' + (status === 'booked' ? 'booked' : '');
                lodgeDiv.style.left = x*1.5 + 'px';
                lodgeDiv.style.top = y + 'px';
                lodgeDiv.style.width = capacity * 25 + 'px';
                lodgeDiv.style.height = capacity * 10 + 'px';
                lodgeDiv.dataset.id = id;
                lodgeDiv.dataset.name = name;
                lodgeDiv.dataset.capacity = capacity;
                lodgeDiv.dataset.cost = cost;
                lodgeDiv.dataset.status = status;
                lodgeDiv.dataset.imagePath = imagePath;

                const lodgeLabel = document.createElement('div');
                lodgeLabel.className = 'lodge-label';
                lodgeLabel.textContent = `${id}`;
                lodgeDiv.appendChild(lodgeLabel);

                lodgeDiv.addEventListener('mouseover', showPopup);
                lodgeDiv.addEventListener('mouseout', hidePopup);

                lodgeDiv.addEventListener('click', () => {
                    if (lodgeDiv.classList.contains('available')) {
                        selectLodge(lodgeDiv);
                    }
                });

                map.appendChild(lodgeDiv);
            });
        })
        .catch(error => console.error('Error loading XML data:', error));
}

function showPopup(event) {
    const lodgeDiv = event.target.closest('.lodge');
    if (!lodgeDiv) return;

    const name = lodgeDiv.dataset.name;
    const capacity = lodgeDiv.dataset.capacity;
    const cost = lodgeDiv.dataset.cost;
    const status = lodgeDiv.dataset.status;
    const imagePath = lodgeDiv.dataset.imagePath;

    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
        <h3>${name}</h3>
        <p>Capacity: ${capacity}</p>
        <p>Cost: $${cost}</p>
        <p>Status: ${status}</p>
        <img src="${imagePath}" alt="${name}">
    `;

    const lodgeRect = lodgeDiv.getBoundingClientRect();
    const popupWidth = 100;
    const mapRect = document.getElementById('map').getBoundingClientRect();
    const popupX = lodgeRect.left + lodgeRect.width + popupWidth > mapRect.right ? lodgeRect.left - popupWidth : lodgeRect.right;
    const popupY = lodgeRect.top;

    popup.style.left = popupX + 'px';
    popup.style.top = popupY + 'px';
    document.body.appendChild(popup);

    lodgeDiv.addEventListener('mouseout', () => {
        document.body.removeChild(popup);
    }, { once: true });
}

function hidePopup(event) {
    const popup = document.querySelector('.popup');
    if (popup) {
        popup.remove();
    }
}

function searchLodges() {
    const numPeople = parseInt(document.getElementById('numPeople').value);
    const lodges = document.querySelectorAll('.lodge');

    lodges.forEach(lodge => {
        const capacity = parseInt(lodge.dataset.capacity);
        if (capacity >= numPeople && lodge.dataset.status === 'available') {
            lodge.classList.add('available');
            lodge.classList.remove('unavailable');
        } else {
            lodge.classList.add('unavailable');
            lodge.classList.remove('available');
        }
    });
}

function selectLodge(lodgeDiv) {
    const numPeople = parseInt(document.getElementById('numPeople').value);
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;

    const capacity = parseInt(lodgeDiv.dataset.capacity);
    if (capacity < numPeople) {
        alert('Selected lodge cannot accommodate the number of people.');
        return;
    }

    const cost = parseInt(lodgeDiv.dataset.cost);
    const days = (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24);
    const totalCost = cost * days;

    const summary = document.getElementById('summary');
    summary.innerHTML = `
        <h3>Booking Summary</h3>
        <p>Check-in: ${checkin}</p>
        <p>Check-out: ${checkout}</p>
        <p>Number of People: ${numPeople}</p>
        <p>Lodge: ${lodgeDiv.dataset.name}</p>
        <p>Cost per Day: $${cost}</p>
        <p>Total Cost: $${totalCost}</p>
        <button onclick="confirmBooking(${lodgeDiv.dataset.id})">Confirm Booking</button>
    `;
}

function confirmBooking(lodgeId) {
    const lodgeDiv = document.querySelector(`.lodge[data-id='${lodgeId}']`);
    const checkin = document.getElementById('checkin').value;
    const checkout = document.getElementById('checkout').value;
    const numPeople = document.getElementById('numPeople').value;
    const cost = lodgeDiv.dataset.cost;
    const days = (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24);
    const totalCost = cost * days;

    const finalSummary = document.getElementById('final-summary');
    finalSummary.innerHTML = `
        <h3>Final Booking Summary</h3>
        <p>Check-in: ${checkin}</p>
        <p>Check-out: ${checkout}</p>
        <p>Number of People: ${numPeople}</p>
        <p>Lodge: ${lodgeDiv.dataset.name}</p>
        <p>Cost per Day: $${cost}</p>
        <p>Total Cost: $${totalCost}</p>
        <button onclick="redirectToHome()">Return to Home</button>
    `;
    finalSummary.style.display = 'block';

    // Mark the lodge as booked
    lodgeDiv.classList.remove('available');
    lodgeDiv.classList.add('booked');
    lodgeDiv.dataset.status = 'booked';

    // Hide summary and map
    document.getElementById('summary').style.display = 'none';
    document.getElementById('map').style.display = 'none';
    document.getElementById('lodge-info').style.display = 'none';
}

function redirectToHome() {
    document.getElementById('final-summary').style.display = 'none';
    document.getElementById('summary').style.display = 'block';
    document.getElementById('map').style.display = 'block';
    document.getElementById('lodge-info').style.display = 'block';
    window.location.reload();

    // Refresh the lodges status
    loadLodges();
}
